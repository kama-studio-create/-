import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TournamentCard = styled.div`
  background: #1a1b3a;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' && `
    background: #6366f1;
    color: white;
    &:hover:not(:disabled) { background: #4f46e5; }
  `}
  
  ${props => props.variant === 'success' && `
    background: #10b981;
    color: white;
    cursor: default;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TournamentScreen = ({ userId }) => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joined, setJoined] = useState(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/tournament/list');
      setTournaments(response.data.tournaments || []);
    } catch (err) {
      setError('Failed to fetch tournaments');
      console.error('Tournament fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinTournament = async (tournamentId) => {
    try {
      setLoading(true);
      await axios.post('/api/tournament/join', { userId, tournamentId });
      setJoined(tournamentId);
      setTournaments(prev => 
        prev.map(t => t._id === tournamentId 
          ? { ...t, players: [...t.players, userId] }
          : t
        )
      );
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to join tournament';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startTournament = async (tournamentId) => {
    try {
      setLoading(true);
      await axios.post(`/api/tournament/start/${tournamentId}`);
      await fetchTournaments(); // Refresh list after starting
    } catch (err) {
      alert('Failed to start tournament');
    } finally {
      setLoading(false);
    }
  };

  if (loading && tournaments.length === 0) {
    return (
      <Container>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button variant="primary" onClick={fetchTournaments}>
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1 className="text-2xl font-bold">🏆 Active Tournaments</h1>
        <Button variant="primary" onClick={fetchTournaments}>
          🔄 Refresh
        </Button>
      </Header>

      {tournaments.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No active tournaments at the moment
        </div>
      ) : (
        tournaments.map((tournament) => (
          <TournamentCard key={tournament._id}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">{tournament.name}</h2>
                <p className="text-gray-400">
                  Status: {tournament.status}
                </p>
                <p className="text-gray-400">
                  Players: {tournament.players.length} / {tournament.maxPlayers}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {tournament.status === 'registering' && (
                  <Button
                    variant={joined === tournament._id ? 'success' : 'primary'}
                    disabled={joined === tournament._id || loading}
                    onClick={() => joinTournament(tournament._id)}
                  >
                    {joined === tournament._id ? '✅ Joined' : '🎮 Join Tournament'}
                  </Button>
                )}
                
                {tournament.status === 'in_progress' && (
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/tournament/${tournament._id}`)}
                  >
                    👁 View Matches
                  </Button>
                )}

                {userId === tournament.createdBy && tournament.status === 'waiting' && (
                  <Button
                    variant="primary"
                    onClick={() => startTournament(tournament._id)}
                  >
                    🚀 Start Tournament
                  </Button>
                )}
              </div>
            </div>
          </TournamentCard>
        ))
      )}
    </Container>
  );
};

export default TournamentScreen;



