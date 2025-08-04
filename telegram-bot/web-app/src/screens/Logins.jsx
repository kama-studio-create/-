import React, { useEffect, useState } from 'react';
import { getTelegramUser } from '../telegram';

const Login = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tgUser = getTelegramUser();
    if (tgUser) {
      setUser(tgUser);
      // Optionally send to backend for session creation
      // fetch('/api/auth/telegram-login', { method: 'POST', body: JSON.stringify(tgUser) });
    }
  }, []);

  return (
    <div className="text-white p-4">
      {user ? (
        <>
          <h2>Welcome {user.first_name}!</h2>
          <p>You’re now inside Mythic Warriors 🎮</p>
        </>
      ) : (
        <p>Loading Telegram user...</p>
      )}
    </div>
  );
};

export default Login;


useEffect(() => {
  const tgUser = getTelegramUser();
  if (tgUser) {
    setUser(tgUser);

    // Send to backend
    fetch('http://localhost:5000/api/auth/telegram-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tgUser)
    });
  }
}, []);
