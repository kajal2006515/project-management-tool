import { Router, Request, Response } from 'express';

const router = Router();

// Simulated aggregated stats for the impact dashboard
// In production: query from DB aggregations + blockchain stats

const DEMO_STATS = {
  calls_scanned_total: 84721,
  scams_flagged_total: 3847,
  scams_confirmed_total: 2203,
  users_protected: 12450,
  estimated_money_saved_inr: 42800000, // ₹4.28 crore
  blockchain_reports_total: 2203,
  blockchain_network: 'Sepolia Testnet',
  // Geo heatmap data (lat/lng + count)
  heatmap_points: [
    { lat: 28.6139, lng: 77.209, count: 312, city: 'Delhi' },
    { lat: 19.076, lng: 72.8777, count: 487, city: 'Mumbai' },
    { lat: 12.9716, lng: 77.5946, count: 298, city: 'Bengaluru' },
    { lat: 22.5726, lng: 88.3639, count: 201, city: 'Kolkata' },
    { lat: 17.385, lng: 78.4867, count: 178, city: 'Hyderabad' },
    { lat: 13.0827, lng: 80.2707, count: 156, city: 'Chennai' },
    { lat: 23.0225, lng: 72.5714, count: 134, city: 'Ahmedabad' },
    { lat: 18.5204, lng: 73.8567, count: 189, city: 'Pune' },
    { lat: 26.9124, lng: 75.7873, count: 98, city: 'Jaipur' },
    { lat: 25.3176, lng: 82.9739, count: 87, city: 'Varanasi' },
    { lat: 21.1458, lng: 79.0882, count: 76, city: 'Nagpur' },
    { lat: 30.7333, lng: 76.7794, count: 65, city: 'Chandigarh' },
  ],
  // Weekly trend (last 8 weeks)
  weekly_trend: [
    { week: 'W1', scans: 8200, flags: 312 },
    { week: 'W2', scans: 9800, flags: 389 },
    { week: 'W3', scans: 10500, flags: 421 },
    { week: 'W4', scans: 11200, flags: 467 },
    { week: 'W5', scans: 10800, flags: 445 },
    { week: 'W6', scans: 12100, flags: 521 },
    { week: 'W7', scans: 11600, flags: 498 },
    { week: 'W8', scans: 10521, flags: 394 },
  ],
  // Detection breakdown
  detection_reasons: [
    { reason: 'Mel-frequency irregularity', count: 1423 },
    { reason: 'Phase discontinuity', count: 987 },
    { reason: 'Unnatural background noise', count: 654 },
    { reason: 'Formant deviation', count: 521 },
    { reason: 'Registry match', count: 262 },
  ],
  // Language breakdown
  languages: [
    { lang: 'Hindi', code: 'hi', scans: 41230, scam_rate: 4.7 },
    { lang: 'English', code: 'en', scans: 28900, scam_rate: 3.9 },
    { lang: 'Bengali', code: 'bn', scans: 8420, scam_rate: 5.2 },
    { lang: 'Tamil', code: 'ta', scans: 6171, scam_rate: 3.1 },
  ],
};

// GET /api/suraksha/dashboard/stats
router.get('/stats', (_req: Request, res: Response) => {
  // Add live jitter to make it feel dynamic in demos
  const jitter = (base: number, pct: number = 0.01) =>
    Math.round(base * (1 + (Math.random() - 0.5) * pct));

  res.json({
    ...DEMO_STATS,
    calls_scanned_total: jitter(DEMO_STATS.calls_scanned_total),
    scams_flagged_total: jitter(DEMO_STATS.scams_flagged_total),
    users_protected: jitter(DEMO_STATS.users_protected),
    generated_at: new Date().toISOString(),
  });
});

// GET /api/suraksha/dashboard/heatmap
router.get('/heatmap', (_req: Request, res: Response) => {
  res.json({ points: DEMO_STATS.heatmap_points });
});

// GET /api/suraksha/dashboard/trend
router.get('/trend', (_req: Request, res: Response) => {
  res.json({ weekly: DEMO_STATS.weekly_trend });
});

export default router;
