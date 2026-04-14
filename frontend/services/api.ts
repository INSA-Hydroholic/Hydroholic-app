const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
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

export const challengesApi = {
  getAll: () => request('/challenges'),
  create: (payload: { name: string; type: string; objective: number; duration: string; creatorId: string }) =>
    request('/challenges', { method: 'POST', body: payload }),
  join: (challengeId: string, userId: string) => request(`/challenges/${challengeId}/join`, { method: 'POST', body: { userId } }),
  progress: (challengeId: string, userId: string, amountMl: number) =>
    request(`/challenges/${challengeId}/progress`, { method: 'POST', body: { userId, amountMl } })
};

export const usersApi = {
  getAll: () => request('/users'),
  getById: (userId: string) => request(`/users/${userId}`),
  getRecommendations: (userId: string) => request(`/users/${userId}/recommendations`),
  ranking: () => request('/users/ranking')
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
