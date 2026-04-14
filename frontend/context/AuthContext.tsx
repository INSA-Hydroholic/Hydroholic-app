import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, setAuthToken } from '@/services/api';

const STORAGE_TOKEN_KEY = 'auth_token';
const STORAGE_USER_KEY = 'auth_user';

type AuthContextType = {
  isAuthReady: boolean;
  isLoggedIn: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setRecommendations: (recommendations: any) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem(STORAGE_TOKEN_KEY),
          AsyncStorage.getItem(STORAGE_USER_KEY)
        ]);

        if (savedToken && savedUser) {
          setAuthToken(savedToken);
          setUser(JSON.parse(savedUser));
          setIsLoggedIn(true);
        }
      } catch (error) {
        setAuthToken(null);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsAuthReady(true);
      }
    };

    restoreSession();
  }, []);

  const login = async (username: string, password: string) => {
    const data = await authApi.login(username, password);
    setAuthToken(data.token);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_TOKEN_KEY, data.token),
      AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user))
    ]);
    setIsLoggedIn(true);
    setUser(data.user);
  };

  const register = async (userData: any) => {
    const data = await authApi.register(userData);
    setAuthToken(data.token);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_TOKEN_KEY, data.token),
      AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user))
    ]);
    setIsLoggedIn(true);
    setUser(data.user);
  };

  const logout = () => {
    setAuthToken(null);
    void Promise.all([
      AsyncStorage.removeItem(STORAGE_TOKEN_KEY),
      AsyncStorage.removeItem(STORAGE_USER_KEY)
    ]);
    setIsLoggedIn(false);
    setUser(null);
  };

  const setRecommendations = (recommendations: any) => {
    setUser({ ...user, recommendations });
  };

  return (
    <AuthContext.Provider value={{ isAuthReady, isLoggedIn, user, login, register, logout, setRecommendations }}>
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
