import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { DbSchema } from './types';

const file = join(__dirname, '../db.json');
const adapter = new JSONFile<DbSchema>(file);
const defaultData: DbSchema = {
  users: [],
  challenges: [],
  recommendations: [
    { id: 'r1', title: 'Bois plus tôt', description: 'Commence ta journée avec un verre d eau.' },
    { id: 'r2', title: 'Fixe des rappels', description: 'Programmes 3 rappels pour boire toutes les 2 h.' },
    { id: 'r3', title: 'Varie tes boissons', description: 'Ajoute citron, menthe ou thé vert à ton eau.' }
  ]
};

const db = new Low<DbSchema>(adapter, defaultData);

export const initDb = async (): Promise<void> => {
  await db.read();

  if (!db.data) {
    db.data = defaultData;
  }

  if (!db.data.users || db.data.users.length === 0) {
    const passwordHash = await bcrypt.hash('test123', 10);
    const userId = nanoid();

    db.data.users.push({
      id: userId,
      username: 'demo',
      email: 'demo@example.com',
      fullname: 'Demo User',
      passwordHash,
      challengeIds: [],
      waterCompletedMl: 0,
      score: 0
    });
  }

  if (!db.data.challenges || db.data.challenges.length === 0) {
    const challengeId = nanoid();
    db.data.challenges.push({
      id: challengeId,
      name: 'Boire 2L',
      type: 'daily',
      objective: 2000,
      duration: '1 jour',
      participants: [db.data.users[0].id],
      progressByUser: { [db.data.users[0].id]: 0 },
      creatorId: db.data.users[0].id,
      createdAt: new Date().toISOString()
    });
    db.data.users[0].challengeIds.push(challengeId);
  }

  await db.write();
};

export const getDb = (): Low<DbSchema> => {
  if (!db.data) {
    throw new Error('Database not initialized');
  }
  return db;
};
