import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../index';

const router = Router();
router.use(authenticate);

const taskSelect = {
  id: true, title: true, description: true, priority: true, due_date: true, position: true,
  column_id: true, created_by: true, created_at: true,
  assignees: { include: { user: { select: { id: true, name: true, avatar_url: true } } } },
  tags: true,
};

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, column: { board: { project: { members: { some: { user_id: req.user!.userId } } } } } },
    include: { ...taskSelect, assignees: { include: { user: { select: { id: true, name: true, avatar_url: true } } } } },
  });
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
  res.json({ task });
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().nullable().optional(),
  column_id: z.string().optional(),
  position: z.number().optional(),
  assignee_ids: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
}).partial();

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, column: { board: { project: { members: { some: { user_id: req.user!.userId } } } } } },
    include: { column: { include: { board: true } } },
  });
  if (!task) { res.status(403).json({ error: 'Forbidden' }); return; }

  const data = updateSchema.parse(req.body);
  const { assignee_ids, ...rest } = data;

  const updated = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      due_date: rest.due_date ? new Date(rest.due_date) : rest.due_date === null ? null : undefined,
      ...(assignee_ids !== undefined && {
        assignees: {
          deleteMany: {},
          create: assignee_ids.map(uid => ({ user_id: uid })),
        },
      }),
    },
    include: { assignees: { include: { user: { select: { id: true, name: true, avatar_url: true } } } } },
  });

  const boardId = task.column.board_id;
  io.to(`board:${boardId}`).emit('task:updated', { task: updated, boardId });
  res.json({ task: updated });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, column: { board: { project: { members: { some: { user_id: req.user!.userId } } } } } },
    include: { column: { include: { board: true } } },
  });
  if (!task) { res.status(403).json({ error: 'Forbidden' }); return; }
  await prisma.task.delete({ where: { id: req.params.id } });
  io.to(`board:${task.column.board_id}`).emit('task:deleted', { taskId: req.params.id, columnId: task.column_id });
  res.json({ message: 'Task deleted' });
});

export default router;
