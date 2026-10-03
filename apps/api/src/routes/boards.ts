import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const board = await prisma.board.findFirst({
    where: {
      id: req.params.id,
      project: { members: { some: { user_id: req.user!.userId } } },
    },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          tasks: {
            orderBy: { position: 'asc' },
            include: {
              assignees: { include: { user: { select: { id: true, name: true, avatar_url: true } } } },
            },
          },
        },
      },
      project: { include: { members: { include: { user: { select: { id: true, name: true, email: true, avatar_url: true } } } } } },
    },
  });
  if (!board) { res.status(404).json({ error: 'Board not found' }); return; }
  res.json({ board });
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const board = await prisma.board.findFirst({
    where: { id: req.params.id, project: { members: { some: { user_id: req.user!.userId } } } },
  });
  if (!board) { res.status(403).json({ error: 'Forbidden' }); return; }
  const updated = await prisma.board.update({ where: { id: req.params.id }, data: { name: req.body.name } });
  res.json({ board: updated });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const board = await prisma.board.findFirst({
    where: { id: req.params.id, project: { members: { some: { user_id: req.user!.userId, role: { in: ['owner', 'admin'] } } } } },
  });
  if (!board) { res.status(403).json({ error: 'Forbidden' }); return; }
  await prisma.board.delete({ where: { id: req.params.id } });
  res.json({ message: 'Board deleted' });
});

router.post('/:id/columns', async (req: AuthRequest, res: Response) => {
  const board = await prisma.board.findFirst({
    where: { id: req.params.id, project: { members: { some: { user_id: req.user!.userId } } } },
  });
  if (!board) { res.status(403).json({ error: 'Forbidden' }); return; }
  const count = await prisma.column.count({ where: { board_id: req.params.id } });
  const column = await prisma.column.create({
    data: { name: req.body.name || 'New Column', board_id: req.params.id, position: count },
  });
  res.status(201).json({ column });
});

export default router;
