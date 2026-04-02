const API_URL = process.env.API_URL || 'http://localhost:4000/api';
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

export const hydrationApi = {
  log: (payload: { amountMl: number; time: number; userId?: string }) =>
    request('/hydration', { method: 'POST', body: payload }),
  history: () => request('/hydration')
};
