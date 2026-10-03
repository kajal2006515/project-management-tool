import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Helper: check if user is a member of the project containing the board/column
async function checkProjectMembership(userId: string, projectId: string) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return !!member;
}

// POST /api/projects/:projectId/boards - Create a board in a project
router.post('/project/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { projectId } = req.params;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Board name is required' });

  try {
    const isMember = await checkProjectMembership(req.user.id, projectId);
    if (!isMember) return res.status(403).json({ error: 'Access denied' });

    // Find the max position to place this board at the end
    const lastBoard = await prisma.board.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
    });
    const position = lastBoard ? lastBoard.position + 1000 : 1000;

    const board = await prisma.board.create({
      data: {
        projectId,
        name,
        position,
      },
    });

    // Automatically create default columns for a new board: To Do, In Progress, Done
    await prisma.column.createMany({
      data: [
        { boardId: board.id, name: 'To Do', position: 1000 },
        { boardId: board.id, name: 'In Progress', position: 2000 },
        { boardId: board.id, name: 'Done', position: 3000 },
      ],
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// GET /api/boards/:id - Retrieve board layout with columns and tasks
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  try {
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                assignees: {
                  include: {
                    user: {
                      select: { id: true, name: true, email: true, avatarUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!board) return res.status(404).json({ error: 'Board not found' });

    const isMember = await checkProjectMembership(req.user.id, board.projectId);
    if (!isMember) return res.status(403).json({ error: 'Access denied' });

    res.json(board);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve board details' });
  }
});

// POST /api/boards/:id/columns - Add a column to a board
router.post('/:id/columns', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Column name is required' });

  try {
    const board = await prisma.board.findUnique({ where: { id } });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const isMember = await checkProjectMembership(req.user.id, board.projectId);
    if (!isMember) return res.status(403).json({ error: 'Access denied' });

    const lastColumn = await prisma.column.findFirst({
      where: { boardId: id },
      orderBy: { position: 'desc' },
    });
    const position = lastColumn ? lastColumn.position + 1000 : 1000;

    const column = await prisma.column.create({
      data: {
        boardId: id,
        name,
        position,
      },
    });

    res.status(201).json(column);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create column' });
  }
});

// PATCH /api/columns/:id - Rename or reposition a column
router.patch('/columns/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const { name, position } = req.body;

  try {
    const column = await prisma.column.findUnique({
      where: { id },
      include: { board: true },
    });
    if (!column) return res.status(404).json({ error: 'Column not found' });

    const isMember = await checkProjectMembership(req.user.id, column.board.projectId);
    if (!isMember) return res.status(403).json({ error: 'Access denied' });

    const updatedColumn = await prisma.column.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        position: position !== undefined ? position : undefined,
      },
    });

    res.json(updatedColumn);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update column' });
  }
});

// DELETE /api/columns/:id - Delete a column
router.delete('/columns/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  try {
    const column = await prisma.column.findUnique({
      where: { id },
      include: { board: true },
    });
    if (!column) return res.status(404).json({ error: 'Column not found' });

    const isMember = await checkProjectMembership(req.user.id, column.board.projectId);
    if (!isMember) return res.status(403).json({ error: 'Access denied' });

    await prisma.column.delete({ where: { id } });
    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete column' });
  }
});

export default router;
