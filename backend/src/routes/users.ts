import { Router } from 'express';
import { getDb } from '../db';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const users = db.data!.users.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    fullname: u.fullname,
    challengeIds: u.challengeIds,
    waterCompletedMl: u.waterCompletedMl,
    score: u.score
  }));
  res.json(users);
});

router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const db = getDb();
  const user = db.data!.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  const sanitized = {
    id: user.id,
    username: user.username,
    email: user.email,
    fullname: user.fullname,
    challengeIds: user.challengeIds,
    waterCompletedMl: user.waterCompletedMl,
    score: user.score
  };

  res.json(sanitized);
});

router.get('/:userId/recommendations', (req, res) => {
  const { userId } = req.params;
  const db = getDb();
  const user = db.data!.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  res.json(db.data!.recommendations);
});

router.get('/ranking', (req, res) => {
  const db = getDb();
  const ranking = [...db.data!.users]
    .sort((a, b) => b.score - a.score)
    .map((u) => ({ username: u.username, score: u.score, waterCompletedMl: u.waterCompletedMl }));
  res.json(ranking);
});

router.post('/:userId/water', async (req, res) => {
  const { userId } = req.params;
  const { amountMl } = req.body;

  if (!amountMl || amountMl <= 0) {
    return res.status(400).json({ message: 'amountMl > 0 requis' });
  }
  const db = getDb();
  const user = db.data!.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  user.waterCompletedMl += amountMl;
  user.score += Math.floor(amountMl / 100);

  await db.write();

  res.json({ user: { ...user, passwordHash: undefined }, added: amountMl });
});

export default router;
