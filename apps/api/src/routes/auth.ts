import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ error: 'Email already in use' }); return; }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password_hash },
      select: { id: true, name: true, email: true, avatar_url: true, created_at: true },
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    res.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
    res.status(201).json({ user, accessToken });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    throw err;
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.status(401).json({ error: 'Invalid credentials' }); return; }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    res.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
    res.json({
      user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
      accessToken,
    });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    throw err;
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (!token) { res.status(401).json({ error: 'No refresh token' }); return; }
  try {
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({ userId: payload.userId, email: payload.email });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out' });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, avatar_url: true, created_at: true },
  });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ user });
});

export default router;
