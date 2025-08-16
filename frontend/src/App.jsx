import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';
import LeagueLeaderboardPage from './pages/LeagueLeaderboardPage';
import DeckBuilderPage from './pages/DeckBuilderPage';
import BattlePage from './pages/BattlePage';
import DashboardPage from './pages/DashboardPage';
import TournamentPage from './pages/TournamentPage';
import SpectatorPage from './pages/SpectatorPage';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage or Telegram Web App
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // First check localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setLoading(false);
          return;
        }

        // Then check Telegram Web App
        if (window.Telegram?.WebApp) {
          const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
          if (tgUser) {
            // You might want to validate this user with your backend
            console.log('Telegram user detected:', tgUser);
            // Optionally auto-login or register the Telegram user
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

  // Update localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Mythic Warriors...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Navbar user={currentUser} setUser={setCurrentUser} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={<DashboardScreen user={currentUser} />} 
            />
            <Route 
              path="/login" 
              element={<LoginScreen setUser={setCurrentUser} />} 
            />
            <Route 
              path="/register" 
              element={<RegisterScreen setUser={setCurrentUser} />} 
            />
            <Route 
              path="/league" 
              element={<LeagueLeaderboard />} 
            />
            <Route 
              path="/spectate/:matchId" 
              element={<SpectatorScreen />} 
            />

            {/* Protected Routes */}
            <Route
              path="/deck"
              element={
                <PrivateRoute user={currentUser}>
                  <DeckBuilderScreen userId={currentUser?._id} />
                </PrivateRoute>
              }
            />

            <Route
              path="/battle"
              element={
                <PrivateRoute user={currentUser}>
                  <BattleScreen userId={currentUser?._id} />
                </PrivateRoute>
              }
            />

            <Route
              path="/marketplace"
              element={
                <PrivateRoute user={currentUser}>
                  <MarketplaceScreen userId={currentUser?._id} />
                </PrivateRoute>
              }
            />

            <Route
              path="/tournament"
              element={
                <PrivateRoute user={currentUser}>
                  <TournamentScreen userId={currentUser?._id} />
                </PrivateRoute>
              }
            />

            <Route
              path="/referral"
              element={
                <PrivateRoute user={currentUser}>
                  <ReferralSubmit userId={currentUser?._id} />
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
  );
}

export default App;