import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    const initializeWebApp = () => {
      if (tg) {
        tg.ready();
        tg.expand();

        const initData = tg.initDataUnsafe;
        if (initData?.user) {
          setUser({
            id: initData.user.id,
            username: initData.user.username,
            firstName: initData.user.first_name,
            lastName: initData.user.last_name,
          });
        }
      }
      setLoading(false);
    };

    initializeWebApp();
  }, []);

  const value = {
    user,
    loading,
    tg,
    isAuthenticated: !!user,
  };

  if (loading) {
    return null; // or a loading spinner component
  }

  return (
    <AuthContext.Provider value={value}>
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