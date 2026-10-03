import { Router, Request, Response } from 'express';

const router = Router();

// In-memory store for demo (replace with Prisma/DB in production)
const sessions: Record<string, any> = {};
const riskEvents: Record<string, any[]> = {};

// POST /api/suraksha/call-sessions/start
router.post('/start', (req: Request, res: Response) => {
  const { caller_number, user_id } = req.body;
  if (!caller_number) {
    return res.status(400).json({ error: 'caller_number required' });
  }
  const id = `cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const session = {
    id,
    user_id: user_id || 'demo-user',
    caller_number,
    start_time: new Date().toISOString(),
    end_time: null,
    risk_score_final: null,
    status: 'active',
  };
  sessions[id] = session;
  riskEvents[id] = [];
  res.status(201).json({ session });
});

// POST /api/suraksha/call-sessions/:id/risk-event
router.post('/:id/risk-event', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!sessions[id]) return res.status(404).json({ error: 'Session not found' });

  const { risk_score, detection_reason } = req.body;
  const event = {
    id: `re_${Date.now()}`,
    call_session_id: id,
    timestamp: new Date().toISOString(),
    risk_score: risk_score ?? Math.random() * 100,
    detection_reason: detection_reason || 'spectral_anomaly',
  };
  riskEvents[id].push(event);

  // Emit via Socket.io if available
  try {
    const { io } = require('../../index');
    io.emit('risk:update', { session_id: id, ...event });
  } catch (_) {}

  res.status(201).json({ event });
});

// POST /api/suraksha/call-sessions/:id/end
router.post('/:id/end', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!sessions[id]) return res.status(404).json({ error: 'Session not found' });

  const events = riskEvents[id] || [];
  const finalScore = events.length
    ? events.reduce((sum, e) => sum + e.risk_score, 0) / events.length
    : 0;

  sessions[id].end_time = new Date().toISOString();
  sessions[id].risk_score_final = Math.round(finalScore);
  sessions[id].status = 'ended';

  res.json({ session: sessions[id], events });
});

// GET /api/suraksha/call-sessions/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!sessions[id]) return res.status(404).json({ error: 'Session not found' });
  res.json({ session: sessions[id], events: riskEvents[id] || [] });
});

// GET /api/suraksha/call-sessions  (history)
router.get('/', (_req: Request, res: Response) => {
  res.json({ sessions: Object.values(sessions) });
});

export default router;
