// src/App.jsx - Your main app file
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import your screens
import DashboardScreen from './screens/DashboardScreen';
import DeckBuilderScreen from './screens/DeckBuilderScreen';
import BattleScreen from './screens/BattleScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import ClanScreen from './screens/ClanScreen';
import TournamentScreen from './screens/TournamentScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ProfileScreen from './screens/ProfileScreen';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from Telegram Web App
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check Telegram Web App
        if (window.Telegram?.WebApp) {
          const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
          if (tgUser) {
            // Fetch user data from your backend
            const response = await fetch(`/api/users/${tgUser.id}`);
            const userData = await response.json();
            setCurrentUser(userData);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error initializing user:', error);
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Mythic Warriors...</div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <Navbar user={currentUser} setUser={setCurrentUser} />
          
          <main>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={<DashboardScreen user={currentUser} />} 
              />
              
              <Route 
                path="/leaderboard" 
                element={<LeaderboardScreen user={currentUser} />} 
              />

              {/* Protected Routes */}
              <Route
                path="/deck"
                element={
                  <PrivateRoute user={currentUser}>
                    <DeckBuilderScreen user={currentUser} />
                  </PrivateRoute>
                }
              />

              <Route
                path="/battle"
                element={
                  <PrivateRoute user={currentUser}>
                    <BattleScreen user={currentUser} />
                  </PrivateRoute>
                }
              />

              <Route
                path="/marketplace"
                element={
                  <PrivateRoute user={currentUser}>
                    <MarketplaceScreen user={currentUser} />
                  </PrivateRoute>
                }
              />

              <Route
                path="/clan"
                element={
                  <PrivateRoute user={currentUser}>
                    <ClanScreen user={currentUser} />
                  </PrivateRoute>
                }
              />

              <Route
                path="/tournament"
                element={
                  <PrivateRoute user={currentUser}>
                    <TournamentScreen user={currentUser} />
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <PrivateRoute user={currentUser}>
                    <ProfileScreen user={currentUser} />
                  </PrivateRoute>
                }
              />

              {/* Fallback Route */}
              <Route 
                path="*" 
                element={
                  <div className="text-center text-white py-20">
                    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                    <p className="text-xl">The page you're looking for doesn't exist.</p>
                  </div>
                } 
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;