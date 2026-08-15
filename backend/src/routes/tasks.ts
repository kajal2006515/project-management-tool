import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Helper: check project membership through column ID
async function checkMembershipByColumn(userId: string, columnId: string) {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });
  if (!column) return null;
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: column.board.projectId,
        userId,
      },
    },
  });
  return member ? column.board.projectId : null;
}

// POST /api/columns/:columnId/tasks - Create task
router.post('/column/:columnId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { columnId } = req.params;
  const { title, description, priority, dueDate } = req.body;

  if (!title) return res.status(400).json({ error: 'Task title is required' });

  try {
    const projectId = await checkMembershipByColumn(req.user.id, columnId);
    if (!projectId) return res.status(403).json({ error: 'Access denied' });

    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: 'desc' },
    });
    const position = lastTask ? lastTask.position + 1000 : 1000;

    const task = await prisma.task.create({
      data: {
        columnId,
        title,
        description,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        position,
      },
      include: {
        assignees: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } }
          }
        }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// GET /api/tasks/:id - Get a single task details
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        column: { include: { board: true } },
        assignees: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } }
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } }
          }
        }
      }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.column.board.projectId,
          userId: req.user.id
        }
      }
    });
    if (!member) return res.status(403).json({ error: 'Access denied' });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve task details' });
  }
});

// PATCH /api/tasks/:id - Update task details, column position or assignees
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const { title, description, priority, dueDate, position, columnId, assigneeIds } = req.body;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { column: { include: { board: true } } }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.column.board.projectId,
          userId: req.user.id
        }
      }
    });
    if (!member) return res.status(403).json({ error: 'Access denied' });

    // Handle column change check if provided
    if (columnId && columnId !== task.columnId) {
      const destinationProjectId = await checkMembershipByColumn(req.user.id, columnId);
      if (!destinationProjectId || destinationProjectId !== task.column.board.projectId) {
        return res.status(403).json({ error: 'Cannot move task to a different project board' });
      }
    }

    // Handle database update
    const updated = await prisma.$transaction(async (tx) => {
      // Sync assignees if passed
      if (assigneeIds !== undefined) {
        await tx.taskAssignee.deleteMany({ where: { taskId: id } });
        if (assigneeIds.length > 0) {
          await tx.taskAssignee.createMany({
            data: assigneeIds.map((userId: string) => ({
              taskId: id,
              userId
            }))
          });
        }
      }

      return await tx.task.update({
        where: { id },
        data: {
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          priority: priority !== undefined ? priority : undefined,
          dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
          position: position !== undefined ? position : undefined,
          columnId: columnId !== undefined ? columnId : undefined,
        },
        include: {
          assignees: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarUrl: true } }
            }
          }
        }
      });
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { column: { include: { board: true } } }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.column.board.projectId,
          userId: req.user.id
        }
      }
    });
    if (!member) return res.status(403).json({ error: 'Access denied' });

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
