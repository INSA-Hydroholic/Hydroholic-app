import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db';
import authRouter from './routes/auth';
import challengesRouter from './routes/challenges';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/users', usersRouter);

app.get('/api/ping', (req, res) => res.json({ status: 'ok', message: 'Hydroholic backend en marche' }));

const PORT = Number(process.env.PORT || 4000);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Hydroholic backend démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Impossible d initialiser la base de données', err);
    process.exit(1);
  });
