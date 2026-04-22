import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';
const MOCK_CHALLENGES_KEY = 'mock:challenges:v1';
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

const request = async (path: string, options: RequestOptions = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorJson.message || 'Erreur API');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const authApi = {
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),
  register: (payload: { username: string; email: string; password: string; fullname?: string }) =>
    request('/auth/register', { method: 'POST', body: payload })
};

type Challenge = {
  id: string;
  name: string;
  type: string;
  duration: string;
  objective: number;
  creatorId: string;
  participants: string[];
  progressByUser: Record<string, number>;
};

type ChallengeCreatePayload = {
  name: string;
  type: string;
  objective: number;
  duration: string;
  creatorId: string;
};

const defaultMockChallenges: Challenge[] = [
  {
    id: 'mock-1',
    name: 'Hydratation Quotidienne',
    type: 'daily',
    duration: '7',
    objective: 2.5,
    creatorId: '1',
    participants: ['1', '2'],
    progressByUser: { '1': 1.2, '2': 0.8 },
  },
  {
    id: 'mock-2',
    name: 'Defi Equipe Bureau',
    type: 'team',
    duration: '7',
    objective: 12,
    creatorId: '2',
    participants: ['2', '3'],
    progressByUser: { '2': 4.5, '3': 3.1 },
  },
  {
    id: 'mock-3',
    name: 'Weekend Bien-Etre',
    type: 'daily',
    duration: '1',
    objective: 2,
    creatorId: '3',
    participants: ['3'],
    progressByUser: { '3': 0.4 },
  },
];

const cloneDefaultMockChallenges = (): Challenge[] =>
  defaultMockChallenges.map((challenge) => ({
    ...challenge,
    participants: [...challenge.participants],
    progressByUser: { ...challenge.progressByUser },
  }));

const readMockChallenges = async (): Promise<Challenge[]> => {
  try {
    const stored = await AsyncStorage.getItem(MOCK_CHALLENGES_KEY);

    if (!stored) {
      const seeded = cloneDefaultMockChallenges();
      await AsyncStorage.setItem(MOCK_CHALLENGES_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid mock challenges payload');
    }

    return parsed as Challenge[];
  } catch {
    const fallback = cloneDefaultMockChallenges();
    await AsyncStorage.setItem(MOCK_CHALLENGES_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

const writeMockChallenges = async (challenges: Challenge[]) => {
  await AsyncStorage.setItem(MOCK_CHALLENGES_KEY, JSON.stringify(challenges));
};

const mockChallengesApi = {
  getAll: async () => {
    return readMockChallenges();
  },
  create: async (payload: ChallengeCreatePayload) => {
    const challenges = await readMockChallenges();
    const creatorId = String(payload.creatorId);

    const newChallenge: Challenge = {
      id: `mock-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      name: payload.name,
      type: payload.type,
      duration: payload.duration,
      objective: payload.objective,
      creatorId,
      participants: [creatorId],
      progressByUser: { [creatorId]: 0 },
    };

    const updated = [newChallenge, ...challenges];
    await writeMockChallenges(updated);
    return newChallenge;
  },
  join: async (challengeId: string, userId: string) => {
    const challenges = await readMockChallenges();
    const normalizedUserId = String(userId);
    const index = challenges.findIndex((challenge) => challenge.id === challengeId);

    if (index < 0) {
      throw new Error('Defi introuvable.');
    }

    const challenge = challenges[index];
    const nextParticipants = challenge.participants.map(String);

    if (!nextParticipants.includes(normalizedUserId)) {
      nextParticipants.push(normalizedUserId);
    }

    const nextChallenge: Challenge = {
      ...challenge,
      participants: nextParticipants,
      progressByUser: {
        ...challenge.progressByUser,
        [normalizedUserId]: challenge.progressByUser?.[normalizedUserId] ?? 0,
      },
    };

    challenges[index] = nextChallenge;
    await writeMockChallenges(challenges);
    return nextChallenge;
  },
  progress: async (challengeId: string, userId: string, amountMl: number) => {
    const challenges = await readMockChallenges();
    const normalizedUserId = String(userId);
    const index = challenges.findIndex((challenge) => challenge.id === challengeId);

    if (index < 0) {
      throw new Error('Defi introuvable.');
    }

    const challenge = challenges[index];
    const previous = Number(challenge.progressByUser?.[normalizedUserId] ?? 0);
    const delta = Number(amountMl) || 0;

    const nextChallenge: Challenge = {
      ...challenge,
      progressByUser: {
        ...challenge.progressByUser,
        [normalizedUserId]: Math.max(0, previous + delta),
      },
    };

    challenges[index] = nextChallenge;
    await writeMockChallenges(challenges);
    return nextChallenge;
  },
};

export const challengesApi = {
  getAll: () => (USE_MOCK_API ? mockChallengesApi.getAll() : request('/challenges')),
  create: (payload: { name: string; type: string; objective: number; duration: string; creatorId: string }) =>
    USE_MOCK_API
      ? mockChallengesApi.create(payload)
      : request('/challenges', { method: 'POST', body: payload }),
  join: (challengeId: string, userId: string) =>
    USE_MOCK_API
      ? mockChallengesApi.join(challengeId, userId)
      : request(`/challenges/${challengeId}/join`, { method: 'POST', body: { userId } }),
  progress: (challengeId: string, userId: string, amountMl: number) =>
    USE_MOCK_API
      ? mockChallengesApi.progress(challengeId, userId, amountMl)
      : request(`/challenges/${challengeId}/progress`, { method: 'POST', body: { userId, amountMl } })
};

export const usersApi = {
  getAll: () => request('/users'),
  getById: (userId: string) => request(`/users/${userId}`),
  getRecommendations: (userId: string) => request(`/users/${userId}/recommendations`),
  ranking: () => request('/users/ranking'),
  getConsumption: (userId: string, startDate: string, endDate: string) =>
    request(`/users/${userId}/consumption?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
};

type LoadCellMeasurementPayload = {
  userId: string;
  weight: number;
  source: 'app' | 'hydrobase';
  measured_at: number | string; // UNIX timestamp in seconds or milliseconds
};

const toIsoTimestamp = (input: number | string): string => {
  const numeric = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(`Invalid measured_at timestamp: ${input}`);
  }

  // ESP packets send Unix time in seconds. Keep millisecond compatibility.
  const timestampMs = numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
  const parsed = new Date(timestampMs);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Unable to parse measured_at timestamp: ${input}`);
  }

  return parsed.toISOString();
};

export const hydrationApi = {
  pushMeasurement: (payload: LoadCellMeasurementPayload) => {
    const weight = Math.round(payload.weight * 100) / 100; // Round to 2 decimal places - toFixed returns a string, so we use Math.round instead
    const timestamp = toIsoTimestamp(payload.measured_at);
    console.log(`Pushing measurement for user ${payload.userId}: ${weight}g from source ${payload.source} at ${timestamp}. \nPayload:`, payload);
    return request(`/users/${payload.userId}/water`, {
      method: 'POST',
      body: {
        weight, 
        source: payload.source, 
        measured_at: timestamp 
      }
    });
  }
};
