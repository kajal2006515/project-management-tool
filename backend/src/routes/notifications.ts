import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications - Get all notifications for current user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  try {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch('/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

export default router;
