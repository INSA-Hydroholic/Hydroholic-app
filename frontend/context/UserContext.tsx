import React, { createContext, useState, useContext, ReactNode } from 'react';

export type UserProfile = {
  id: string;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  telephone?: string;
  age?: number;
  sexe?: string;
  region?: string;
  poids?: number;
  activiteSportive?: {
    seances: number;
    intensive: boolean;
  };
  photo?: string;
  bio?: string;
  objectifJournalier: number; // en litres
  hydrationAujourdhui: number; // en litres
};

type UserContextType = {
  userProfile: UserProfile | null;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addWater: (amount: number) => void;
  getRecommendation: (age: number, sexe: string, poids: number, activite: number, intensive: boolean) => number;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => (prev ? { ...prev, ...profile } : null));
  };

  const addWater = (amount: number) => {
    setUserProfile((prev) =>
      prev ? { ...prev, hydrationAujourdhui: prev.hydrationAujourdhui + amount } : null
    );
  };

  const getRecommendation = (
    age: number,
    sexe: string,
    poids: number,
    activite: number,
    intensive: boolean
  ): number => {
    // Calcul base: 30ml par kg de poids
    let recommendation = poids * 0.03;

    // Ajustement par âge
    if (age < 18) {
      recommendation *= 0.9;
    } else if (age > 65) {
      recommendation *= 1.1;
    }

    // Ajustement par activité sportive
    if (activite > 0) {
      const bonus = intensive ? activite * 0.5 : activite * 0.3;
      recommendation += bonus;
    }

    return Math.round(recommendation * 10) / 10;
  };

  return (
    <UserContext.Provider value={{ userProfile, updateProfile, addWater, getRecommendation }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
