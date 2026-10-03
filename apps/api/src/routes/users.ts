import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/me', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, avatar_url: true, created_at: true },
  });
  res.json({ user });
});

router.patch('/me', async (req: AuthRequest, res: Response) => {
  const { name, avatar_url } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { ...(name && { name }), ...(avatar_url && { avatar_url }) },
    select: { id: true, name: true, email: true, avatar_url: true },
  });
  res.json({ user });
});

export default router;
