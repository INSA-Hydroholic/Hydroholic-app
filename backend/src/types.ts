export type PublicUser = {
  id: number;
  username: string;
  email: string;
  fullname: string;
  challengeIds: string[];
  waterCompletedMl: number;
  score: number;
};

export type ApiChallenge = {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'team';
  objective: number;
  duration: string;
  participants: string[];
  progressByUser: Record<string, number>;
  creatorId: string;
  createdAt: string;
  title: string;
  description: string;
  status: string;
};
