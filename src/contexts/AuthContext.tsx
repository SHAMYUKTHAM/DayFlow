import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_USER } from '../utils/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dayflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('dayflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dayflow_user');
    }
  }, [user]);

  const login = (email: string, name?: string) => {
    const loggedInUser: User = {
      id: 'user-' + Date.now(),
      name: name || (email.split('@')[0] || 'User'),
      email,
      role: 'Student & Creator',
      createdAt: new Date().toISOString(),
      preferences: {
        theme: 'light',
        defaultPriority: 'medium',
        enableSounds: true,
        autoSaveIntervalMs: 2000,
      },
    };
    setUser(loggedInUser);
  };

  const signup = (name: string, email: string) => {
    login(email, name);
  };

  const logout = () => {
    setUser(null);
  };

  const loginAsDemo = () => {
    setUser(INITIAL_USER);
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUser,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
