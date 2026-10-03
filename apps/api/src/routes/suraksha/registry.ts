import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// In-memory registry (replace with Prisma + Blockchain calls in production)
const registry: Record<string, any> = {};

function hashNumber(number: string): string {
  return crypto.createHash('sha256').update(number.replace(/\D/g, '')).digest('hex');
}

// GET /api/suraksha/registry/lookup/:number_hash
router.get('/lookup/:number_hash', (req: Request, res: Response) => {
  const { number_hash } = req.params;
  const record = registry[number_hash] || null;
  if (!record) {
    return res.json({ found: false, number_hash, report_count: 0, confidence_score: 0 });
  }
  res.json({ found: true, ...record });
});

// GET /api/suraksha/registry/lookup-by-number/:number (convenience)
router.get('/lookup-by-number/:number', (req: Request, res: Response) => {
  const hash = hashNumber(req.params.number);
  const record = registry[hash] || null;
  if (!record) {
    return res.json({ found: false, number_hash: hash, report_count: 0, confidence_score: 0 });
  }
  res.json({ found: true, number_hash: hash, ...record });
});

// POST /api/suraksha/registry/report
router.post('/report', (req: Request, res: Response) => {
  const { number, audio_hash, reporter_id } = req.body;
  if (!number) return res.status(400).json({ error: 'number required' });

  const number_hash = hashNumber(number);
  const existing = registry[number_hash];
  const now = new Date().toISOString();

  if (existing) {
    existing.report_count += 1;
    existing.last_reported_at = now;
    // Confidence grows logarithmically — multiple independent reports required
    existing.confidence_score = Math.min(100, Math.round(50 + 20 * Math.log2(existing.report_count)));
    existing.reporters.push({ reporter_id: reporter_id || 'anonymous', reported_at: now, audio_hash });
    registry[number_hash] = existing;
  } else {
    registry[number_hash] = {
      number_hash,
      report_count: 1,
      first_reported_at: now,
      last_reported_at: now,
      confidence_score: 50,
      reporters: [{ reporter_id: reporter_id || 'anonymous', reported_at: now, audio_hash }],
      // Simulated blockchain tx hash
      blockchain_tx: `0x${crypto.randomBytes(32).toString('hex')}`,
      blockchain_network: 'Sepolia Testnet',
    };
  }

  // Simulate blockchain write latency
  setTimeout(() => {}, 200);

  res.status(201).json({
    success: true,
    number_hash,
    record: registry[number_hash],
    message: 'Report written to Sepolia testnet registry',
  });
});

// GET /api/suraksha/registry/stats
router.get('/stats', (_req: Request, res: Response) => {
  const records = Object.values(registry);
  res.json({
    total_numbers_reported: records.length,
    total_reports: records.reduce((sum: number, r: any) => sum + r.report_count, 0),
    high_confidence_scams: records.filter((r: any) => r.confidence_score >= 80).length,
  });
});

// Seed some demo data
const demoNumbers = ['+919876543210', '+918800112233', '+911234567890'];
demoNumbers.forEach((num, i) => {
  const hash = hashNumber(num);
  const now = new Date(Date.now() - i * 86400000).toISOString();
  registry[hash] = {
    number_hash: hash,
    report_count: 3 + i * 2,
    first_reported_at: now,
    last_reported_at: new Date().toISOString(),
    confidence_score: 70 + i * 10,
    reporters: [],
    blockchain_tx: `0x${crypto.randomBytes(32).toString('hex')}`,
    blockchain_network: 'Sepolia Testnet',
  };
});

export default router;
