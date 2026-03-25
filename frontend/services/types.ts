export type UserData = {
  id?: string;
  username: string;
  email: string;
  fullname?: string;
  challengeIds?: string[];
  waterCompletedMl?: number;
  score?: number;
};

export type AuthResponse = {
  token: string;
  user: UserData;
};

export type ChallengeData = {
  id?: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'team';
  objective: number;
  duration: string;
  creatorId?: string;
  participants?: string[];
  progressByUser?: Record<string, number>;
};
