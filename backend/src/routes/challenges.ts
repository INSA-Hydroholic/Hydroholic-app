import { Router } from 'express';
import { getDb } from '../db';
import { ApiChallenge } from '../types';

const router = Router();

const buildDurationLabel = (startDate: Date, endDate: Date): string => {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
};

const toApiChallenge = (challenge: {
  id: number;
  title: string;
  description: string;
  status: string;
  creator_id: number;
  created_at: Date;
  start_date: Date;
  end_date: Date;
  participants?: Array<{ userID: number }>;
}): ApiChallenge => {
  const participants = (challenge.participants ?? []).map((p) => String(p.userID));
  return {
    id: String(challenge.id),
    name: challenge.title,
    type: 'daily',
    objective: 2000,
    duration: buildDurationLabel(challenge.start_date, challenge.end_date),
    participants,
    progressByUser: participants.reduce<Record<string, number>>((acc, participantId) => {
      acc[participantId] = 0;
      return acc;
    }, {}),
    creatorId: String(challenge.creator_id),
    createdAt: challenge.created_at.toISOString(),
    title: challenge.title,
    description: challenge.description,
    status: challenge.status
  };
};

const parseDurationDays = (duration: string | undefined): number => {
  if (!duration) return 1;
  const numeric = Number(String(duration).match(/\d+/)?.[0] ?? 1);
  return Number.isNaN(numeric) ? 1 : Math.max(1, numeric);
};

router.get('/', async (req, res) => {
  const db = getDb();
  const challenges = await db.challenge.findMany({
    include: {
      participants: true
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  res.json(challenges.map(toApiChallenge));
});

router.get('/:challengeId', async (req, res) => {
  const { challengeId } = req.params;
  const numericChallengeId = Number(challengeId);
  if (Number.isNaN(numericChallengeId)) {
    return res.status(400).json({ message: 'challengeId invalide' });
  }

  const db = getDb();
  const challenge = await db.challenge.findUnique({
    where: { id: numericChallengeId },
    include: {
      participants: true
    }
  });

  if (!challenge) {
    return res.status(404).json({ message: 'Challenge non trouvé' });
  }

  res.json(toApiChallenge(challenge));
});

router.put('/:challengeId', async (req, res) => {
  const { challengeId } = req.params;
  const numericChallengeId = Number(challengeId);
  if (Number.isNaN(numericChallengeId)) {
    return res.status(400).json({ message: 'challengeId invalide' });
  }

  const { name, title, description, duration, status } = req.body;
  const durationDays = parseDurationDays(duration);
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);

  const db = getDb();
  const challenge = await db.challenge.findUnique({ where: { id: numericChallengeId } });
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge non trouvé' });
  }

  const updated = await db.challenge.update({
    where: { id: numericChallengeId },
    data: {
      title: title || name || challenge.title,
      description: description || challenge.description,
      status: status || challenge.status,
      ...(duration ? { start_date: startDate, end_date: endDate } : {})
    },
    include: {
      participants: true
    }
  });

  res.json(toApiChallenge(updated));
});

router.delete('/:challengeId', async (req, res) => {
  const { challengeId } = req.params;
  const numericChallengeId = Number(challengeId);
  if (Number.isNaN(numericChallengeId)) {
    return res.status(400).json({ message: 'challengeId invalide' });
  }

  const db = getDb();
  const challenge = await db.challenge.findUnique({ where: { id: numericChallengeId } });
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge non trouvé' });
  }

  await db.challengeParticipant.deleteMany({
    where: { challengeID: numericChallengeId }
  });

  const deleted = await db.challenge.delete({
    where: { id: numericChallengeId }
  });

  res.json({ deleted: toApiChallenge({ ...deleted, participants: [] }) });
});

router.post('/', async (req, res) => {
  const { name, title, type, objective, duration, creatorId, description, start_date, end_date, status } = req.body;
  if (!creatorId || !(name || title)) {
    return res.status(400).json({ message: 'Champs manquants pour créer un challenge' });
  }

  const numericCreatorId = Number(creatorId);
  if (Number.isNaN(numericCreatorId)) {
    return res.status(400).json({ message: 'creatorId invalide' });
  }

  const durationDays = parseDurationDays(duration);
  const startDate = start_date ? new Date(start_date) : new Date();
  const endDate = end_date ? new Date(end_date) : new Date(startDate);
  if (!end_date) {
    endDate.setDate(endDate.getDate() + durationDays);
  }

  const db = getDb();
  const creator = await db.user.findUnique({ where: { id: numericCreatorId } });
  if (!creator) {
    return res.status(404).json({ message: 'Créateur non trouvé' });
  }

  const created = await db.challenge.create({
    data: {
      creator_id: numericCreatorId,
      title: String(title || name),
      description: String(description || `Type: ${type || 'daily'} - Objectif: ${objective || 2000}ml`),
      start_date: startDate,
      end_date: endDate,
      status: String(status || 'active')
    },
    include: {
      participants: true
    }
  });

  await db.challengeParticipant.create({
    data: {
      challengeID: created.id,
      userID: numericCreatorId,
      status: 'active'
    }
  });

  const withParticipants = await db.challenge.findUnique({
    where: { id: created.id },
    include: { participants: true }
  });

  res.status(201).json(toApiChallenge(withParticipants!));
});

router.post('/:challengeId/join', async (req, res) => {
  const { challengeId } = req.params;
  const { userId } = req.body;
  const numericChallengeId = Number(challengeId);
  const numericUserId = Number(userId);

  if (Number.isNaN(numericChallengeId)) {
    return res.status(400).json({ message: 'challengeId invalide' });
  }
  if (!userId) {
    return res.status(400).json({ message: 'userId requis pour rejoindre' });
  }
  if (Number.isNaN(numericUserId)) {
    return res.status(400).json({ message: 'userId invalide' });
  }

  const db = getDb();
  const challenge = await db.challenge.findUnique({
    where: { id: numericChallengeId },
    include: { participants: true }
  });
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge non trouvé' });
  }

  const user = await db.user.findUnique({ where: { id: numericUserId } });
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  const existingParticipant = await db.challengeParticipant.findFirst({
    where: {
      challengeID: numericChallengeId,
      userID: numericUserId
    }
  });

  if (!existingParticipant) {
    await db.challengeParticipant.create({
      data: {
        challengeID: numericChallengeId,
        userID: numericUserId,
        status: 'active'
      }
    });
  }

  const updated = await db.challenge.findUnique({
    where: { id: numericChallengeId },
    include: { participants: true }
  });

  res.json(toApiChallenge(updated!));
});

router.post('/:challengeId/progress', async (req, res) => {
  const { challengeId } = req.params;
  const { userId, amountMl } = req.body;
  const numericChallengeId = Number(challengeId);
  const numericUserId = Number(userId);

  if (!userId || !amountMl || amountMl <= 0) {
    return res.status(400).json({ message: 'userId et amountMl > 0 requis' });
  }
  if (Number.isNaN(numericChallengeId) || Number.isNaN(numericUserId)) {
    return res.status(400).json({ message: 'Identifiants invalides' });
  }

  const db = getDb();
  const challenge = await db.challenge.findUnique({
    where: { id: numericChallengeId },
    include: { participants: true }
  });
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge non trouvé' });
  }

  const isParticipant = challenge.participants.some((p) => p.userID === numericUserId && p.status !== 'quit');
  if (!isParticipant) {
    return res.status(403).json({ message: 'Utilisateur ne participe pas à ce challenge' });
  }

  await db.hydrationLog.create({
    data: {
      userID: numericUserId,
      weight_value: Number(amountMl)
    }
  });

  const totalHydration = await db.hydrationLog.aggregate({
    where: {
      userID: numericUserId,
      measured_at: {
        gte: challenge.start_date,
        lte: challenge.end_date
      }
    },
    _sum: {
      weight_value: true
    }
  });

  const userProgress = totalHydration._sum.weight_value ?? 0;
  const objective = Number(req.body.objective ?? 2000);
  const percentComplete = Math.min(100, Math.round((userProgress / objective) * 100));

  const updatedChallenge = await db.challenge.findUnique({
    where: { id: numericChallengeId },
    include: { participants: true }
  });

  res.json({ challenge: toApiChallenge(updatedChallenge!), userProgress, percentComplete });
});

export default router;
