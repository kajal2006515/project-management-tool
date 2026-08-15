import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Helper: check project membership through task ID
async function checkMembershipByTask(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { column: { include: { board: true } } }
  });
  if (!task) return null;
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: task.column.board.projectId,
        userId
      }
    }
  });
  return member ? task : null;
}

// POST /api/tasks/:taskId/comments - Add comment to task
router.post('/task/:taskId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { taskId } = req.params;
  const { body } = req.body;

  if (!body) return res.status(400).json({ error: 'Comment body is required' });

  try {
    const task = await checkMembershipByTask(req.user.id, taskId);
    if (!task) return res.status(403).json({ error: 'Access denied' });

    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId: req.user.id,
        body,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// GET /api/tasks/:taskId/comments - Retrieve comments for a task
router.get('/task/:taskId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { taskId } = req.params;

  try {
    const task = await checkMembershipByTask(req.user.id, taskId);
    if (!task) return res.status(403).json({ error: 'Access denied' });

    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } }
      }
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comments' });
  }
});

export default router;
