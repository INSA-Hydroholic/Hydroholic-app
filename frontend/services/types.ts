export type UserData = {
  id?: string;
  username: string;
  email: string;
  nom?: string;   
  prenom?: string;    
  telephone?: string;  
  age?: number;
  poids?: number;
  sexe?: 'H' | 'F' | '';
  activiteIntense?: number;
  activiteModeree?: number;
  ville?: string; 
  fullname?: string;
  challengeIds?: string[];
  waterCompletedMl?: number;
  score?: number;
};

export type RegisterData = {
  nom: string;
  prenom: string;
  username: string;
  email: string;
  telephone: string;
  password: string;
  age?: string;
  poids?: string;
  sexe?: string;
  activiteIntense?: string;
  activiteModeree?: string;
  ville?: string;
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
