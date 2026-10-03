import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const createSchema = z.object({ name: z.string().min(1), description: z.string().optional(), color: z.string().optional() });

router.get('/', async (req: AuthRequest, res: Response) => {
  const memberships = await prisma.projectMember.findMany({
    where: { user_id: req.user!.userId },
    include: { project: { include: { members: { include: { user: { select: { id: true, name: true, avatar_url: true } } } }, _count: { select: { boards: true } } } } },
  });
  res.json({ projects: memberships.map(m => m.project) });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, description, color } = createSchema.parse(req.body);
  const project = await prisma.project.create({
    data: {
      name, description, color: color || '#6366f1', owner_id: req.user!.userId,
      members: { create: { user_id: req.user!.userId, role: 'owner' } },
    },
    include: { members: { include: { user: { select: { id: true, name: true, avatar_url: true } } } } },
  });
  res.status(201).json({ project });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, members: { some: { user_id: req.user!.userId } } },
    include: {
      boards: { orderBy: { position: 'asc' } },
      members: { include: { user: { select: { id: true, name: true, email: true, avatar_url: true } } } },
    },
  });
  if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
  res.json({ project });
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const member = await prisma.projectMember.findFirst({
    where: { project_id: req.params.id, user_id: req.user!.userId, role: { in: ['owner', 'admin'] } },
  });
  if (!member) { res.status(403).json({ error: 'Forbidden' }); return; }
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: { name: req.body.name, description: req.body.description, color: req.body.color },
  });
  res.json({ project });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const proj = await prisma.project.findFirst({ where: { id: req.params.id, owner_id: req.user!.userId } });
  if (!proj) { res.status(403).json({ error: 'Forbidden' }); return; }
  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ message: 'Project deleted' });
});

router.post('/:id/members', async (req: AuthRequest, res: Response) => {
  const admin = await prisma.projectMember.findFirst({
    where: { project_id: req.params.id, user_id: req.user!.userId, role: { in: ['owner', 'admin'] } },
  });
  if (!admin) { res.status(403).json({ error: 'Forbidden' }); return; }
  const { email, role } = z.object({ email: z.string().email(), role: z.enum(['admin', 'member']).default('member') }).parse(req.body);
  const invitee = await prisma.user.findUnique({ where: { email } });
  if (!invitee) { res.status(404).json({ error: 'User not found' }); return; }
  const member = await prisma.projectMember.upsert({
    where: { project_id_user_id: { project_id: req.params.id, user_id: invitee.id } },
    update: { role },
    create: { project_id: req.params.id, user_id: invitee.id, role },
    include: { user: { select: { id: true, name: true, email: true, avatar_url: true } } },
  });
  res.status(201).json({ member });
});

router.post('/:id/boards', async (req: AuthRequest, res: Response) => {
  const member = await prisma.projectMember.findFirst({ where: { project_id: req.params.id, user_id: req.user!.userId } });
  if (!member) { res.status(403).json({ error: 'Forbidden' }); return; }
  const count = await prisma.board.count({ where: { project_id: req.params.id } });
  const board = await prisma.board.create({
    data: { name: req.body.name || 'New Board', project_id: req.params.id, position: count },
  });
  res.status(201).json({ board });
});

export default router;
