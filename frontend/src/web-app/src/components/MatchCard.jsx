import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Card = styled.div`
  background: #1a1b3a;
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MatchStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  background: ${props => 
    props.status === 'in_progress' ? '#2196F3' :
    props.status === 'completed' ? '#4CAF50' :
    '#888'};
  color: white;
`;

const Players = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const Player = styled.div`
  flex: 1;
  text-align: ${props => props.align};
  color: ${props => props.isWinner ? '#4CAF50' : '#fff'};
`;

const VS = styled.div`
  display: flex;
  align-items: center;
  color: #888;
  font-weight: bold;
`;

const Stats = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #888;
`;

const MatchCard = ({ match, onClick }) => {
  const {
    id,
    status,
    player1,
    player2,
    startTime,
    turnTime
  } = match;

  return (
    <Card onClick={() => onClick?.(id)}>
      <Header>
        <MatchStatus status={status}>
          {status === 'in_progress' ? '🎮 In Progress' :
           status === 'completed' ? '🏆 Completed' :
           '⏳ Waiting'}
        </MatchStatus>
        {startTime && (
          <span>⏱️ {new Date(startTime).toLocaleTimeString()}</span>
        )}
      </Header>

      <Players>
        <Player align="left" isWinner={player1?.winner}>
          <h3>{player1?.username || 'TBD'}</h3>
          <Stats>
            <span>🏅 {player1?.rating || 0}</span>
            {player1?.cardsPlayed && (
              <span>🎴 {player1.cardsPlayed}</span>
            )}
          </Stats>
        </Player>

        <VS>VS</VS>

        <Player align="right" isWinner={player2?.winner}>
          <h3>{player2?.username || 'TBD'}</h3>
          <Stats>
            <span>🏅 {player2?.rating || 0}</span>
            {player2?.cardsPlayed && (
              <span>🎴 {player2.cardsPlayed}</span>
            )}
          </Stats>
        </Player>
      </Players>

      {status === 'in_progress' && turnTime && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          ⏳ Turn ends in: {Math.ceil(turnTime / 1000)}s
        </div>
      )}
    </Card>
  );
};

MatchCard.propTypes = {
  match: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['waiting', 'in_progress', 'completed']).isRequired,
    player1: PropTypes.shape({
      username: PropTypes.string,
      rating: PropTypes.number,
      cardsPlayed: PropTypes.number,
      winner: PropTypes.bool
    }),
    player2: PropTypes.shape({
      username: PropTypes.string,
      rating: PropTypes.number,
      cardsPlayed: PropTypes.number,
      winner: PropTypes.bool
    }),
    startTime: PropTypes.string,
    turnTime: PropTypes.number
  }).isRequired,
  onClick: PropTypes.func
};

export default MatchCard;