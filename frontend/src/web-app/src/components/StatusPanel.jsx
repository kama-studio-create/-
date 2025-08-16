import React from 'react';
import PropTypes from 'prop-types';
import { Heart, Zap, Shield } from 'lucide-react';
import styled from 'styled-components';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 20rem;
  background: ${props => props.isPlayer ? '#1f2937' : '#111827'};
  color: ${props => props.isPlayer ? '#ffffff' : '#fecaca'};
`;

const Name = styled.h2`
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatRow = styled.div`
  margin-bottom: 0.5rem;
  width: 100%;
`;

const StatLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const ProgressBar = styled.div`
  height: 0.5rem;
  width: 100%;
  background: ${props => props.type === 'health' ? '#991b1b' : '#1e40af'};
  border-radius: 0.25rem;
  margin-top: 0.25rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.type === 'health' ? 
    props.value > 50 ? '#ef4444' : '#dc2626' : 
    '#3b82f6'};
  width: ${props => props.value}%;
  transition: width 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
  }
`;

const ManaContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

const ManaPoint = styled.div`
  width: 0.75rem;
  height: 1.25rem;
  background: ${props => props.active ? '#3b82f6' : '#1e40af'};
  border-radius: 0.125rem;
  transition: background-color 0.2s;
`;

const StatusPanel = ({ 
  isPlayer, 
  name, 
  hp, 
  mana, 
  maxMana = 10,
  shield = 0 
}) => {
  const displayName = name || (isPlayer ? 'You' : 'Enemy');

  return (
    <Panel isPlayer={isPlayer}>
      <Name>
        {isPlayer ? '🎯' : '⚔️'} {displayName}
      </Name>

      <StatRow>
        <StatLabel>
          <Heart size={16} color="#ef4444" />
          <span>{hp} / 100</span>
        </StatLabel>
        <ProgressBar type="health">
          <ProgressFill type="health" value={hp} />
        </ProgressBar>
      </StatRow>

      {shield > 0 && (
        <StatLabel>
          <Shield size={16} color="#a3a3a3" />
          <span>{shield} Shield</span>
        </StatLabel>
      )}

      {isPlayer && (
        <StatRow>
          <StatLabel>
            <Zap size={16} color="#60a5fa" />
            <span>{mana} / {maxMana} Mana</span>
          </StatLabel>
          <ManaContainer>
            {Array.from({ length: maxMana }).map((_, i) => (
              <ManaPoint 
                key={i} 
                active={i < mana}
                title={`Mana Crystal ${i + 1}`}
              />
            ))}
          </ManaContainer>
        </StatRow>
      )}
    </Panel>
  );
};

StatusPanel.propTypes = {
  isPlayer: PropTypes.bool,
  name: PropTypes.string,
  hp: PropTypes.number.isRequired,
  mana: PropTypes.number,
  maxMana: PropTypes.number,
  shield: PropTypes.number
};

StatusPanel.defaultProps = {
  isPlayer: false,
  hp: 100,
  mana: 0,
  maxMana: 10,
  shield: 0
};

export default StatusPanel;
