import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import TournamentBracket from './components/Bracket';

// Styled Components
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const BracketContainer = styled.div`
  display: flex;
  gap: 2rem;
  padding: 2rem;
  overflow-x: auto;
`;

const Round = styled.div`
  min-width: 200px;
`;

const RoundTitle = styled.div`
  text-align: center;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #888;
`;

const RoundMatches = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Match = styled.div`
  background: #1a1b3a;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
  border-left: 4px solid ${props => 
    props.status === 'completed' ? '#4CAF50' : 
    props.status === 'in_progress' ? '#2196F3' : 
    'transparent'
  };

  &:hover {
    transform: scale(1.02);
  }
`;

const Player = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  color: #fff;
  font-weight: ${props => props.isWinner ? 'bold' : 'normal'};
  color: ${props => props.isWinner ? '#4CAF50' : '#fff'};
`;

const Score = styled.span`
  margin-left: 1rem;
  font-weight: bold;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ff4444;
`;

const RetryButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #1a1b3a;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
`;

// Component Implementation
const BracketMatch = ({ match, onMatchClick }) => (
  <Match 
    status={match.status}
    onClick={() => onMatchClick(match.id)}
  >
    <Player isWinner={match.player1?.winner}>
      {match.player1?.username || 'TBD'}
      {match.player1?.score && <Score>{match.player1.score}</Score>}
    </Player>
    <Player isWinner={match.player2?.winner}>
      {match.player2?.username || 'TBD'}
      {match.player2?.score && <Score>{match.player2.score}</Score>}
    </Player>
  </Match>
);

const BracketRound = ({ round, matches, onMatchClick }) => (
  <Round>
    <RoundTitle>Round {round}</RoundTitle>
    <RoundMatches>
      {matches.map(match => (
        <BracketMatch 
          key={match.id}
          match={match}
          onMatchClick={onMatchClick}
        />
      ))}
    </RoundMatches>
  </Round>
);

const TournamentBracket = ({ matches, onMatchClick, isLoading = false, error = null }) => {
  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading tournament bracket...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <p>❌ {error}</p>
        <RetryButton onClick={() => window.location.reload()}>
          Retry
        </RetryButton>
      </ErrorContainer>
    );
  }

  const roundMatches = matches.reduce((acc, match) => {
    acc[match.round] = acc[match.round] || [];
    acc[match.round].push(match);
    return acc;
  }, {});

  return (
    <BracketContainer>
      {Object.entries(roundMatches).map(([round, matches]) => (
        <BracketRound
          key={round}
          round={round}
          matches={matches}
          onMatchClick={onMatchClick}
        />
      ))}
    </BracketContainer>
  );
};

// PropTypes
TournamentBracket.propTypes = {
  matches: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    round: PropTypes.number.isRequired,
    status: PropTypes.oneOf(['pending', 'in_progress', 'completed']).isRequired,
    player1: PropTypes.shape({
      username: PropTypes.string,
      score: PropTypes.number,
      winner: PropTypes.bool
    }),
    player2: PropTypes.shape({
      username: PropTypes.string,
      score: PropTypes.number,
      winner: PropTypes.bool
    })
  })).isRequired,
  onMatchClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

const Tournament = () => {
  // ... state management code ...

  return (
    <TournamentBracket
      matches={matches}
      onMatchClick={handleMatchClick}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default Tournament;