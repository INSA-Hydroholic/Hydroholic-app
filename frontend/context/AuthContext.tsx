import React, { createContext, useState, useContext, ReactNode } from 'react';
import { authApi } from '@/services/api';

type AuthContextType = {
  isLoggedIn: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setRecommendations: (recommendations: any) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Par défaut à true pour les tests sur le menu, false pour test login/logout
  const [user, setUser] = useState<any>(null);

  const login = async (username: string, password: string) => {
    const data = await authApi.login(username, password);
    setIsLoggedIn(true);
    setUser(data.user);
  };

  const register = async (userData: any) => {
    const data = await authApi.register(userData);
    setIsLoggedIn(true);
    setUser(data.user);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const setRecommendations = (recommendations: any) => {
    setUser({ ...user, recommendations });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, register, logout, setRecommendations }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
