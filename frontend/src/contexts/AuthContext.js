import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTelegramUser, isTelegramWebApp } from '../services/telegram';

const AuthContext = createContext();

export const AuthProvider = ({ children, value }) => {
  const [user, setUser] = useState(value?.user || null);
  const [loading, setLoading] = useState(!value);
  const [isAuthenticated, setIsAuthenticated] = useState(!!value?.user);

  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (value) {
      setUser(value.user);
      setIsAuthenticated(!!value.user);
      setLoading(false);
    } else {
      const initializeAuth = () => {
        if (isTelegramWebApp()) {
          const telegramUser = getTelegramUser();
          if (telegramUser) {
            setUser({
              id: telegramUser.id,
              username: telegramUser.username,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name,
            });
            setIsAuthenticated(true);
          }
        }
        setLoading(false);
      };

      initializeAuth();
    }
  }, [value]);

  const contextValue = {
    user: value?.user || user,
    setUser: value?.setUser || setUser,
    logout: value?.logout || (() => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    }),
    loading,
    tg,
    isAuthenticated: value?.user ? !!value.user : isAuthenticated,
    isTelegramWebApp: isTelegramWebApp()
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;