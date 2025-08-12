import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import socket from '../utils/socket';

const Container = styled.div`
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
`;

const ViewerCount = styled.span`
  background: #2196F3;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  color: white;
`;

const LogContainer = styled.div`
  background: #1a1b3a;
  border-radius: 8px;
  padding: 1rem;
  height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #13142e;
  }

  &::-webkit-scrollbar-thumb {
    background: #2d2f63;
    border-radius: 4px;
  }
`;

const LogEntry = styled.div`
  padding: 0.5rem;
  border-bottom: 1px solid #2d2f63;
  color: ${props => props.type === 'damage' ? '#ff4444' : 
                    props.type === 'heal' ? '#4CAF50' : 
                    '#fff'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SpectatorScreen = () => {
  const { matchId } = useParams();
  const [log, setLog] = useState([]);
  const [viewers, setViewers] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const logRef = useRef(null);

  useEffect(() => {
    // Join match room
    socket.emit('joinMatch', { matchId, as: 'spectator' });

    // Listen for match events
    socket.on('cardPlayed', ({ playerId, card, damage }) => {
      addLogEntry({
        type: 'damage',
        message: `${card.name} → ${damage} damage`,
        player: playerId
      });
    });

    socket.on('healEffect', ({ playerId, amount }) => {
      addLogEntry({
        type: 'heal',
        message: `Healed for ${amount}`,
        player: playerId
      });
    });

    socket.on('viewerUpdate', ({ count }) => {
      setViewers(count);
    });

    socket.on('matchData', (data) => {
      setMatchData(data);
    });

    // Cleanup
    return () => {
      socket.off('cardPlayed');
      socket.off('healEffect');
      socket.off('viewerUpdate');
      socket.off('matchData');
      socket.emit('leaveMatch', { matchId });
    };
  }, [matchId]);

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const addLogEntry = (entry) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog(prev => [...prev, { ...entry, timestamp }]);
  };

  if (!matchData) {
    return (
      <Container>
        <Title>Loading match data...</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>👁 Watching Match: {matchId}</Title>
        <ViewerCount>👥 {viewers} watching</ViewerCount>
      </Header>

      {matchData && (
        <div className="mb-4">
          <p className="text-white">
            {matchData.player1?.username} vs {matchData.player2?.username}
          </p>
          <p className="text-gray-400">
            Turn {matchData.currentTurn}
          </p>
        </div>
      )}

      <LogContainer ref={logRef}>
        {log.map((entry, idx) => (
          <LogEntry key={idx} type={entry.type}>
            <span className="text-gray-400">[{entry.timestamp}]</span>
            {' '}
            <span className="font-bold">
              {matchData?.[entry.player]?.username || entry.player}:
            </span>
            {' '}
            {entry.message}
          </LogEntry>
        ))}
      </LogContainer>
    </Container>
  );
};

export default SpectatorScreen;
