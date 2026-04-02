# Hydroholic Backend (TypeScript)

API minimal pour l application Hydroholic.

## Installation

1. `cd backend`
2. `npm install`

## Scripts

- `npm run dev` : démarrage en mode développement avec rechargement.
- `npm run build` : compilation TypeScript dans `dist/`.
- `npm run start` : exécution du build compilé.

## API

- `POST /api/auth/register` : { username, email, password, fullname? }
- `POST /api/auth/login` : { username, password }
- `GET /api/ping`
- `GET /api/challenges`
- `POST /api/challenges` : { name, type, objective, duration, creatorId }
- `POST /api/challenges/:challengeId/join` : { userId }
- `POST /api/challenges/:challengeId/progress` : { userId, amountMl }
- `GET /api/users` 
- `GET /api/users/:userId`
- `GET /api/users/:userId/recommendations`
- `GET /api/users/ranking`

## Notes

- La persistance est gérée par `lowdb` dans `db.json`.
- Pour production, configurez `JWT_SECRET` dans `.env`.
- Intégrez le frontend avec ces routes via `fetch` ou `axios`.
