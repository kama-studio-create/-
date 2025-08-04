import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TournamentScreen = ({ userId }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await axios.get('/api/tournament/list');
      setTournaments(res.data);
    } catch (err) {
      console.error('Failed to fetch tournaments');
    }
  };

  const joinTournament = async (id) => {
    try {
      setLoading(true);
      await axios.post('/api/tournament/join', { userId, tournamentId: id });
      setJoined(id);
      alert('You joined the tournament!');
    } catch (err) {
      alert(err?.response?.data?.message || 'Join failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🏆 Active Tournaments</h2>

      {tournaments.map((t) => (
        <div key={t._id} className="bg-gray-800 p-4 rounded-lg mb-4 shadow-md">
          <h3 className="text-lg font-semibold">{t.name}</h3>
          <p>Status: {t.status}</p>
          <p>Players Joined: {t.players.length}</p>
          <button
            disabled={joined === t._id || loading}
            onClick={() => joinTournament(t._id)}
            className="bg-purple-500 hover:bg-purple-600 px-4 py-2 mt-2 rounded text-white"
          >
            {joined === t._id ? '✅ Joined' : 'Join Tournament'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default TournamentScreen;

<button
  className="bg-blue-600 text-white px-2 py-1 rounded"
  onClick={() => navigate(`/spectate/${match._id}`)}
>
  👁 Watch Match
   className="bg-red-500 text-white px-3 py-1 rounded mt-2"

  onClick={() => axios.post(`/api/tournament/start/${t._id}`)}

  🚀 Start Tournament
</button>



