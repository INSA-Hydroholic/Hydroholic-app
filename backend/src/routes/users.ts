import { Router } from 'express';
import { getDb } from '../db';
import { PublicUser } from '../types';

const router = Router();

const toPublicUser = (user: {
  id: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  participations?: Array<{ challengeID: number }>;
  hydrationLogs?: Array<{ weight_value: number }>;
}): PublicUser => {
  const waterCompletedMl = (user.hydrationLogs ?? []).reduce((acc, log) => acc + log.weight_value, 0);
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullname: `${user.prenom} ${user.nom}`.trim(),
    challengeIds: (user.participations ?? []).map((p) => String(p.challengeID)),
    waterCompletedMl,
    score: Math.floor(waterCompletedMl / 100)
  };
};

router.get('/test/users', async (req, res) => {
  const db = getDb();
  const users = await db.user.findMany({
    include: {
      participations: true,
      hydrationLogs: true
    }
  });

  res.json({ count: users.length, users: users.map(toPublicUser) });
});

router.get('/ranking', async (req, res) => {
  const db = getDb();
  const users = await db.user.findMany({
    include: {
      hydrationLogs: true
    }
  });

  const ranking = users
    .map((u) => {
      const waterCompletedMl = u.hydrationLogs.reduce((acc, log) => acc + log.weight_value, 0);
      return {
        username: u.username,
        score: Math.floor(waterCompletedMl / 100),
        waterCompletedMl
      };
    })
    .sort((a, b) => b.score - a.score);

  res.json(ranking);
});

router.get('/', async (req, res) => {
  const db = getDb();
  const users = await db.user.findMany({
    include: {
      participations: true,
      hydrationLogs: true
    }
  });

  res.json(users.map(toPublicUser));
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const numericUserId = Number(userId);
  if (Number.isNaN(numericUserId)) {
    return res.status(400).json({ message: 'userId invalide' });
  }

  const db = getDb();
  const user = await db.user.findUnique({
    where: { id: numericUserId },
    include: {
      participations: true,
      hydrationLogs: true
    }
  });

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  res.json(toPublicUser(user));
});

router.get('/:userId/recommendations', async (req, res) => {
  const { userId } = req.params;
  const numericUserId = Number(userId);
  if (Number.isNaN(numericUserId)) {
    return res.status(400).json({ message: 'userId invalide' });
  }

  const db = getDb();
  const user = await db.user.findUnique({ where: { id: numericUserId } });
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  res.json([
    {
      id: 'r1',
      title: 'Hydratation matinale',
      description: 'Commence la journée avec un verre d eau avant le petit-déjeuner.'
    },
    {
      id: 'r2',
      title: 'Rythme régulier',
      description: 'Bois toutes les 2 heures pour atteindre ton objectif journalier.'
    },
    {
      id: 'r3',
      title: 'Objectif personnalisé',
      description: `Ton objectif actuel est ${user.daily_goal} mL par jour.`
    }
  ]);
});

router.post('/:userId/water', async (req, res) => {
  const { userId } = req.params;
  const { amountMl } = req.body;
  const numericUserId = Number(userId);

  if (!amountMl || amountMl <= 0) {
    return res.status(400).json({ message: 'amountMl > 0 requis' });
  }
  if (Number.isNaN(numericUserId)) {
    return res.status(400).json({ message: 'userId invalide' });
  }

  const db = getDb();
  const user = await db.user.findUnique({
    where: { id: numericUserId }
  });

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  await db.hydrationLog.create({
    data: {
      userID: numericUserId,
      weight_value: Number(amountMl)
    }
  });

  const userWithData = await db.user.findUnique({
    where: { id: numericUserId },
    include: {
      participations: true,
      hydrationLogs: true
    }
  });

  if (!userWithData) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  res.json({ user: toPublicUser(userWithData), added: amountMl });
});

export default router;
