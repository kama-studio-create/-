import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import StatusPanel from '../components/StatusPanel';
import CardSlot from '../components/CardSlot';

const BattleContainer = styled.div`
  min-height: 100vh;
  background: #111827;
  color: white;
  padding: 1rem;
`;

const StatusContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 1rem;
  margin-top: 1rem;
`;

const HandContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const GameOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const GameResult = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }
`;

const BattleScreen = ({ user, deck, socket }) => {
  const [battleState, setBattleState] = useState({
    hand: [],
    yourHp: 100,
    enemyHp: 100,
    mana: 1,
    enemyName: 'AI Opponent',
    matchEnded: false,
    matchResult: null
  });

  useEffect(() => {
    // Initialize battle
    socket.emit('joinBattle', { userId: user?.id, deck });

    // Battle event handlers
    const eventHandlers = {
      battleReady: ({ hand, yourHp, enemyHp, mana }) => {
        setBattleState(prev => ({
          ...prev,
          hand,
          yourHp,
          enemyHp,
          mana
        }));
      },

      enemyMove: ({ card, damage, yourHp }) => {
        setBattleState(prev => ({
          ...prev,
          yourHp
        }));
        console.log(`Enemy played ${card.name}, hit you for ${damage}`);
      },

      matchEnd: ({ result }) => {
        setBattleState(prev => ({
          ...prev,
          matchEnded: true,
          matchResult: result
        }));
      }
    };

    // Register event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // Cleanup
    return () => {
      Object.keys(eventHandlers).forEach(event => {
        socket.off(event);
      });
    };
  }, [socket, user, deck]);

  const handleCardPlay = (card, index) => {
    socket.emit('playCard', { card });
    setBattleState(prev => ({
      ...prev,
      hand: prev.hand.filter((_, i) => i !== index)
    }));
  };

  const { 
    hand, yourHp, enemyHp, mana, 
    enemyName, matchEnded, matchResult 
  } = battleState;

  return (
    <BattleContainer>
      <StatusContainer>
        <StatusPanel 
          isPlayer={true} 
          name={user?.username} 
          hp={yourHp} 
          mana={mana} 
        />
        <StatusPanel 
          isPlayer={false} 
          name={enemyName} 
          hp={enemyHp} 
        />
      </StatusContainer>

      <HandContainer>
        {hand.map((card, index) => (
          <CardSlot
            key={index}
            card={card}
            onPlay={(card) => handleCardPlay(card, index)}
          />
        ))}
      </HandContainer>

      {matchEnded && (
        <GameOverlay>
          <GameResult>
            {matchResult === 'win' ? '🎉 You Win!' : '😞 You Lose'}
          </GameResult>
          <Button onClick={() => window.location.reload()}>
            Return to Lobby
          </Button>
        </GameOverlay>
      )}
    </BattleContainer>
  );
};

export default BattleScreen;
