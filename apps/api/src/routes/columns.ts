import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const col = await prisma.column.findFirst({
    where: { id: req.params.id, board: { project: { members: { some: { user_id: req.user!.userId } } } } },
  });
  if (!col) { res.status(403).json({ error: 'Forbidden' }); return; }
  const updated = await prisma.column.update({ where: { id: req.params.id }, data: { name: req.body.name } });
  res.json({ column: updated });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const col = await prisma.column.findFirst({
    where: { id: req.params.id, board: { project: { members: { some: { user_id: req.user!.userId } } } } },
  });
  if (!col) { res.status(403).json({ error: 'Forbidden' }); return; }
  await prisma.column.delete({ where: { id: req.params.id } });
  res.json({ message: 'Column deleted' });
});

router.post('/:id/tasks', async (req: AuthRequest, res: Response) => {
  const col = await prisma.column.findFirst({
    where: { id: req.params.id, board: { project: { members: { some: { user_id: req.user!.userId } } } } },
  });
  if (!col) { res.status(403).json({ error: 'Forbidden' }); return; }
  const count = await prisma.task.count({ where: { column_id: req.params.id } });
  const task = await prisma.task.create({
    data: {
      title: req.body.title,
      description: req.body.description || '',
      priority: req.body.priority || 'medium',
      due_date: req.body.due_date ? new Date(req.body.due_date) : null,
      column_id: req.params.id,
      created_by: req.user!.userId,
      position: count,
    },
    include: { assignees: { include: { user: { select: { id: true, name: true, avatar_url: true } } } } },
  });
  res.status(201).json({ task });
});

export default router;
