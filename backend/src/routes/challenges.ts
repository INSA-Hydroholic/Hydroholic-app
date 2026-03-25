import { Router } from 'express';
import { nanoid } from 'nanoid';
import { getDb } from '../db';
import { Challenge } from '../types';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.data!.challenges);
});

router.get('/:challengeId', (req, res) => {
  const { challengeId } = req.params;
  const db = getDb();
  const challenge = db.data!.challenges.find((c) => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge non trouvé' });
  }
  res.json(challenge);
});

router.put('/:challengeId', async (req, res) => {
  const { challengeId } = req.params;
  const { name, type, objective, duration } = req.body;
  const db = getDb();
  const challenge = db.data!.challenges.find((c) => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge non trouvé' });
  }

  if (name) challenge.name = name;
  if (type) challenge.type = type;
  if (objective) challenge.objective = objective;
  if (duration) challenge.duration = duration;

  await db.write();
  res.json(challenge);
});

router.delete('/:challengeId', async (req, res) => {
  const { challengeId } = req.params;
  const db = getDb();
  const index = db.data!.challenges.findIndex((c) => c.id === challengeId);
  if (index === -1) {
    return res.status(404).json({ message: 'Challenge non trouvé' });
  }

  const [deleted] = db.data!.challenges.splice(index, 1);
  db.data!.users.forEach((u) => {
    u.challengeIds = u.challengeIds.filter((id) => id !== challengeId);
  });
  await db.write();
  res.json({ deleted });
});

router.post('/', async (req, res) => {
  const { name, type, objective, duration, creatorId } = req.body;
  if (!name || !type || !objective || !duration || !creatorId) {
    return res.status(400).json({ message: 'Champs manquants pour créer un challenge' });
  }

  const db = getDb();
  const challenge: Challenge = {
    id: nanoid(),
    name,
    type,
    objective,
    duration,
    participants: [creatorId],
    progressByUser: { [creatorId]: 0 },
    creatorId,
    createdAt: new Date().toISOString()
  };

  db.data!.challenges.push(challenge);

  const user = db.data!.users.find((u) => u.id === creatorId);
  if (user) {
    user.challengeIds.push(challenge.id);
  }

  await db.write();
  res.status(201).json(challenge);
});

router.post('/:challengeId/join', async (req, res) => {
  const { challengeId } = req.params;
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'userId requis pour rejoindre' });
  }

  const db = getDb();
  const challenge = db.data!.challenges.find((c) => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge non trouvé' });
  }

  if (!challenge.participants.includes(userId)) {
    challenge.participants.push(userId);
    challenge.progressByUser[userId] = 0;
  }

  const user = db.data!.users.find((u) => u.id === userId);
  if (user && !user.challengeIds.includes(challenge.id)) {
    user.challengeIds.push(challenge.id);
  }

  await db.write();
  res.json(challenge);
});

router.post('/:challengeId/progress', async (req, res) => {
  const { challengeId } = req.params;
  const { userId, amountMl } = req.body;

  if (!userId || !amountMl || amountMl <= 0) {
    return res.status(400).json({ message: 'userId et amountMl > 0 requis' });
  }

  const db = getDb();
  const challenge = db.data!.challenges.find((c) => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge non trouvé' });
  }

  if (!challenge.participants.includes(userId)) {
    return res.status(403).json({ message: 'Utilisateur ne participe pas à ce challenge' });
  }

  challenge.progressByUser[userId] = (challenge.progressByUser[userId] || 0) + amountMl;

  const user = db.data!.users.find((u) => u.id === userId);
  if (user) {
    user.waterCompletedMl += amountMl;
    user.score += Math.floor(amountMl / 100);
  }

  await db.write();

  const userProgress = challenge.progressByUser[userId];
  const percentComplete = Math.min(100, Math.round((userProgress / challenge.objective) * 100));

  res.json({ challenge, userProgress, percentComplete });
});

export default router;
