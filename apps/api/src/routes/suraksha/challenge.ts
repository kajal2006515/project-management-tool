import { Router, Request, Response } from 'express';

const router = Router();

// Family knowledge questions pool
const QUESTION_POOL = [
  { id: 'q1', text: "What is the name of our family pet?", hint: 'pet_name' },
  { id: 'q2', text: "Which city did we celebrate last Diwali?", hint: 'diwali_city' },
  { id: 'q3', text: "What is Papa's favourite cricket team?", hint: 'cricket_team' },
  { id: 'q4', text: "What did we eat on my last birthday?", hint: 'birthday_food' },
  { id: 'q5', text: "What is our family's secret code word?", hint: 'code_word' },
  // Hindi versions
  { id: 'q6', text: "हमारे घर की गाय का नाम क्या है?", hint: 'cow_name', lang: 'hi' },
  { id: 'q7', text: "पिछली ईद पर हम कहाँ गए थे?", hint: 'eid_location', lang: 'hi' },
];

const challenges: Record<string, any> = {};

// POST /api/suraksha/challenge/generate
router.post('/generate', (req: Request, res: Response) => {
  const { session_id, language } = req.body;
  const pool = language === 'hi'
    ? QUESTION_POOL.filter(q => q.lang === 'hi' || !q.lang)
    : QUESTION_POOL.filter(q => q.lang !== 'hi');

  const question = pool[Math.floor(Math.random() * pool.length)];
  const challenge_id = `ch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  challenges[challenge_id] = {
    id: challenge_id,
    session_id,
    question_id: question.id,
    question_text: question.text,
    generated_at: new Date().toISOString(),
    responded: false,
    result: null,
  };

  res.status(201).json({
    challenge_id,
    question: question.text,
    session_id,
  });
});

// POST /api/suraksha/challenge/:id/respond
router.post('/:id/respond', (req: Request, res: Response) => {
  const { id } = req.params;
  const challenge = challenges[id];
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  const { response_time_ms, confidence } = req.body;

  // Scoring logic:
  // - response_time_ms < 2000 → likely genuine (knows immediately)
  // - response_time_ms 2000-6000 → uncertain (pausing, thinking too long)
  // - response_time_ms > 6000 → suspicious (typical AI/scammer delay)
  // - confidence: 0-100 from caller audio analysis
  let result: 'pass' | 'uncertain' | 'fail';
  const rt = response_time_ms ?? 3000;
  const conf = confidence ?? 50;

  if (rt < 2500 && conf >= 60) result = 'pass';
  else if (rt > 6000 || conf < 25) result = 'fail';
  else result = 'uncertain';

  challenge.responded = true;
  challenge.result = result;
  challenge.response_time_ms = rt;
  challenge.responded_at = new Date().toISOString();

  res.json({
    challenge_id: id,
    result,
    response_time_ms: rt,
    message: {
      pass: 'Caller verified as genuine. ✓',
      uncertain: 'Response was hesitant. Exercise caution.',
      fail: 'Caller failed verification. High deepfake probability.',
    }[result],
  });
});

// GET /api/suraksha/challenge/:id
router.get('/:id', (req: Request, res: Response) => {
  const ch = challenges[req.params.id];
  if (!ch) return res.status(404).json({ error: 'Not found' });
  res.json(ch);
});

export default router;
