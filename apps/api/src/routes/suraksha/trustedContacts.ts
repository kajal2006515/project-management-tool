import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// In-memory trusted contacts store
const trustedContacts: Record<string, any[]> = {};

// GET /api/suraksha/trusted-contacts
router.get('/', (req: Request, res: Response) => {
  const user_id = (req.query.user_id as string) || 'demo-user';
  res.json({ contacts: trustedContacts[user_id] || [] });
});

// POST /api/suraksha/trusted-contacts
router.post('/', (req: Request, res: Response) => {
  const { user_id = 'demo-user', contact_name, phone_number, relationship, voiceprint_sample } = req.body;
  if (!contact_name || !phone_number) {
    return res.status(400).json({ error: 'contact_name and phone_number required' });
  }

  const voiceprint_hash = voiceprint_sample
    ? crypto.createHash('sha256').update(voiceprint_sample).digest('hex')
    : crypto.createHash('sha256').update(`${contact_name}_${phone_number}_${Date.now()}`).digest('hex');

  const contact = {
    id: `tc_${Date.now()}`,
    user_id,
    contact_name,
    phone_number: phone_number.replace(/\D/g, '').slice(-10),
    relationship: relationship || 'family',
    voiceprint_hash,
    enrolled_at: new Date().toISOString(),
    last_verified: null,
    verification_count: 0,
  };

  if (!trustedContacts[user_id]) trustedContacts[user_id] = [];
  trustedContacts[user_id].push(contact);

  res.status(201).json({ contact, message: 'Voiceprint enrolled (hash stored, raw audio discarded)' });
});

// DELETE /api/suraksha/trusted-contacts/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req.query.user_id as string) || 'demo-user';
  if (trustedContacts[user_id]) {
    trustedContacts[user_id] = trustedContacts[user_id].filter(c => c.id !== id);
  }
  res.json({ success: true });
});

// POST /api/suraksha/trusted-contacts/verify
router.post('/verify', (req: Request, res: Response) => {
  const { user_id = 'demo-user', caller_number, live_voiceprint } = req.body;
  const contacts = trustedContacts[user_id] || [];

  const callerNormalized = (caller_number || '').replace(/\D/g, '').slice(-10);
  const match = contacts.find(c => c.phone_number === callerNormalized);

  if (!match) {
    return res.json({ verified: false, reason: 'Number not in trust circle' });
  }

  // Simulate voiceprint comparison (in production: cosine similarity on embeddings)
  const liveHash = live_voiceprint
    ? crypto.createHash('sha256').update(live_voiceprint).digest('hex')
    : null;

  const similarity = Math.random() * 40 + 60; // 60-100% demo range
  const verified = similarity >= 75;

  if (verified && match) {
    match.last_verified = new Date().toISOString();
    match.verification_count++;
  }

  res.json({
    verified,
    similarity_score: Math.round(similarity),
    contact: verified ? { name: match.contact_name, relationship: match.relationship } : null,
    message: verified
      ? `✓ Voice matches ${match.contact_name} (${match.relationship})`
      : 'Voice does NOT match known contact',
  });
});

// Seed demo trust circle
trustedContacts['demo-user'] = [
  {
    id: 'tc_demo_1',
    user_id: 'demo-user',
    contact_name: 'Rahul (Son)',
    phone_number: '9876543210',
    relationship: 'son',
    voiceprint_hash: crypto.createHash('sha256').update('rahul_voiceprint').digest('hex'),
    enrolled_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    last_verified: new Date(Date.now() - 86400000).toISOString(),
    verification_count: 4,
  },
  {
    id: 'tc_demo_2',
    user_id: 'demo-user',
    contact_name: 'Priya (Daughter)',
    phone_number: '9988776655',
    relationship: 'daughter',
    voiceprint_hash: crypto.createHash('sha256').update('priya_voiceprint').digest('hex'),
    enrolled_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    last_verified: null,
    verification_count: 2,
  },
];

export default router;
