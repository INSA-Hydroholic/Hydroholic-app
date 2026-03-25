export type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  fullname?: string;
  challengeIds: string[];
  waterCompletedMl: number;
  score: number;
};

export type Challenge = {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'team';
  objective: number;
  duration: string;
  participants: string[];
  progressByUser: Record<string, number>;
  creatorId: string;
  createdAt: string;
};

export type Recommendation = {
  id: string;
  title: string;
  description: string;
};

export type DbSchema = {
  users: User[];
  challenges: Challenge[];
  recommendations: Recommendation[];
};
