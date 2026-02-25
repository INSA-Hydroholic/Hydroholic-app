import React, { createContext, useState, useContext, ReactNode } from 'react';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  const login = async (username: string, password: string) => {
    // TODO: Faire un appel API réel
    setIsLoggedIn(true);
    setUser({ username, email: 'user@example.com' });
  };

  const register = async (userData: any) => {
    // TODO: Faire un appel API réel
    setIsLoggedIn(true);
    setUser(userData);
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
