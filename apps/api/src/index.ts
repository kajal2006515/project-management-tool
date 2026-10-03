import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth';
import usersRouter from './routes/users';
import projectsRouter from './routes/projects';
import boardsRouter from './routes/boards';
import columnsRouter from './routes/columns';
import tasksRouter from './routes/tasks';
import commentsRouter from './routes/comments';
import notificationsRouter from './routes/notifications';
import { registerSocketHandlers } from './socket/handlers';

// ── SurakshaCall Routes ────────────────────────────────────────────────────
import surakshaCallSessionsRouter from './routes/suraksha/callSessions';
import surakshaRegistryRouter from './routes/suraksha/registry';
import surakshaChallengeRouter from './routes/suraksha/challenge';
import surakshaTrustedContactsRouter from './routes/suraksha/trustedContacts';
import surakshaDetectionRouter from './routes/suraksha/detection';
import surakshaDashboardRouter from './routes/suraksha/dashboard';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

export const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, credentials: true },
});

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use('/api/auth', authLimiter);

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/boards', boardsRouter);
app.use('/api/columns', columnsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/notifications', notificationsRouter);

// ── SurakshaCall Endpoints ─────────────────────────────────────────────────
app.use('/api/suraksha/call-sessions', surakshaCallSessionsRouter);
app.use('/api/suraksha/registry', surakshaRegistryRouter);
app.use('/api/suraksha/challenge', surakshaChallengeRouter);
app.use('/api/suraksha/trusted-contacts', surakshaTrustedContactsRouter);
app.use('/api/suraksha/detection', surakshaDetectionRouter);
app.use('/api/suraksha/dashboard', surakshaDashboardRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

registerSocketHandlers(io);

const PORT = parseInt(process.env.PORT || '4000', 10);
httpServer.listen(PORT, () => console.log(`FlowBoard API running on http://localhost:${PORT}`));

export default app;
