import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../utils/socket';

const SpectatorScreen = () => {
  const { matchId } = useParams();
  const [log, setLog] = useState([]);

  useEffect(() => {
    socket.emit('joinMatch', { matchId });

    socket.on('cardPlayed', ({ playerId, card, damage }) => {
      setLog((prev) => [
        ...prev,
        `Player ${playerId} played ${card.name} → ${damage} damage`,
      ]);
    });

    return () => socket.off('cardPlayed');
  }, [matchId]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">👁 Watching Match: {matchId}</h2>

      <div className="bg-gray-900 p-4 rounded">
        {log.map((entry, idx) => (
          <p key={idx} className="text-white">{entry}</p>
        ))}
      </div>
    </div>
  );
};

export default SpectatorScreen;
