import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';
import { PublicUser } from '../types';

type AuthRequest = Request & { user?: { sub: string; username: string } };


const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-secret';
const JWT_EXPIRES_IN = '7d';

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

export const createToken = (user: { id: number; username: string }): string => {
  return jwt.sign({ sub: String(user.id), username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

router.post('/register', async (req, res) => {
  const { username, email, password, fullname, nom, prenom, phone } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email et password sont requis' });
  }

  const db = getDb();
  const existing = await db.user.findFirst({
    where: {
      OR: [{ username }, { email }]
    }
  });

  if (existing) {
    return res.status(409).json({ message: 'Utilisateur déjà existant' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedFullname = typeof fullname === 'string' ? fullname.trim() : '';
  const fullNameParts = normalizedFullname.split(' ').filter(Boolean);
  const inferredPrenom = fullNameParts[0] || username;
  const inferredNom = fullNameParts.slice(1).join(' ') || username;

  const createdUser = await db.user.create({
    data: {
      username,
      email,
      password_hash: passwordHash,
      nom: (nom as string | undefined)?.trim() || inferredNom,
      prenom: (prenom as string | undefined)?.trim() || inferredPrenom,
      phone: (phone as string | undefined)?.trim() || '',
      age: Number(req.body.age ?? 18),
      sex: String(req.body.sex ?? 'unknown'),
      weight: Number(req.body.weight ?? 0),
      height: Number(req.body.height ?? 0),
      region: String(req.body.region ?? ''),
      avatar_url: String(req.body.avatar_url ?? ''),
      num_intense_activities: Number(req.body.num_intense_activities ?? 0),
      num_moderate_activities: Number(req.body.num_moderate_activities ?? 0),
      biography: String(req.body.biography ?? ''),
      daily_goal: Number(req.body.daily_goal ?? 2000)
    },
    include: {
      participations: true,
      hydrationLogs: true
    }
  });

  const token = createToken(createdUser);
  const safeUser = toPublicUser(createdUser);
  return res.status(201).json({ token, user: safeUser });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username et password sont requis' });
  }

  const db = getDb();
  const user = await db.user.findFirst({
    where: {
      OR: [{ username }, { email: username }]
    },
    include: {
      participations: true,
      hydrationLogs: true
    }
  });

  if (!user) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const token = createToken(user);
  const safeUser = toPublicUser(user);
  return res.status(200).json({ token, user: safeUser });
});

const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non identifié' });
    }

    const numericUserId = Number(userId);
    if (Number.isNaN(numericUserId)) {
      return res.status(401).json({ message: 'Token invalide' });
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

    const safeUser = toPublicUser(user);
    return res.json({ user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
