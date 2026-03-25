import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { getDb } from '../db';
import { User } from '../types';

type AuthRequest = Request & { user?: { sub: string; username: string } };


const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-secret';
const JWT_EXPIRES_IN = '7d';

export const createToken = (user: User): string => {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

router.post('/register', async (req, res) => {
  const { username, email, password, fullname } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email et password sont requis' });
  }

  const db = getDb();
  const existing = db.data!.users.find((u) => u.username === username || u.email === email);
  if (existing) {
    return res.status(409).json({ message: 'Utilisateur déjà existant' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id: nanoid(),
    username,
    email,
    fullname,
    passwordHash,
    challengeIds: [],
    waterCompletedMl: 0,
    score: 0
  };

  db.data!.users.push(user);
  await db.write();

  const token = createToken(user);
  const safeUser = { ...user, passwordHash: undefined };
  return res.status(201).json({ token, user: safeUser });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username et password sont requis' });
  }

  const db = getDb();
  const user = db.data!.users.find((u) => u.username === username || u.email === username);
  if (!user) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const token = createToken(user);
  const safeUser = { ...user, passwordHash: undefined };
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

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) {
    return res.status(401).json({ message: 'Utilisateur non identifié' });
  }
  const db = getDb();
  const user = db.data!.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  const safeUser = { ...user, passwordHash: undefined };
  res.json({ user: safeUser });
});

export default router;
