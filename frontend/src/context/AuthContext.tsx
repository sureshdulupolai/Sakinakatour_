import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getMyProfile } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  loginWithToken: (token: string, userProfile: UserProfile) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('diwali_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const savedToken = localStorage.getItem('diwali_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await getMyProfile();
      setUser(profile);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      localStorage.removeItem('diwali_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const loginWithToken = (newToken: string, userProfile: UserProfile) => {
    localStorage.setItem('diwali_token', newToken);
    setToken(newToken);
    setUser(userProfile);
  };

  const logout = () => {
    localStorage.removeItem('diwali_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginWithToken, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

