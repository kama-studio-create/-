import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  color: white;
  padding: 0.75rem;
  background: #1f2937;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Username = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusSection = styled.div`
  margin-top: 0.5rem;
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: #9ca3af;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HealthBar = styled.div`
  width: 100%;
  height: 1rem;
  background: #991b1b;
  border-radius: 0.25rem;
  overflow: hidden;
  position: relative;
`;

const HealthFill = styled.div`
  height: 100%;
  background: ${props => 
    props.hp > 75 ? '#ef4444' : 
    props.hp > 50 ? '#f97316' : 
    props.hp > 25 ? '#f59e0b' : 
    '#dc2626'
  };
  width: ${props => props.hp}%;
  transition: width 0.3s ease-in-out;
  
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

const ManaBar = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

const ManaPoint = styled.div`
  width: 0.75rem;
  height: 1.25rem;
  background: ${props => props.active ? '#3b82f6' : '#1e3a8a'};
  border-radius: 0.125rem;
  transition: all 0.2s;
`;

const Stats = styled.div`
  font-size: 0.875rem;
  margin-top: 0.25rem;
  color: #9ca3af;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const PlayerInfo = ({ username, hp, mana, maxMana = 10, status }) => {
  return (
    <Container>
      <Username>
        {status === 'active' && '🎯'} 
        {username || 'You'}
      </Username>

      <StatusSection>
        <Label>HP</Label>
        <HealthBar>
          <HealthFill hp={hp} />
        </HealthBar>
        <Stats>
          <span>{hp} / 100</span>
          <span>{hp}%</span>
        </Stats>
      </StatusSection>

      <StatusSection>
        <Label>Mana</Label>
        <ManaBar>
          {Array.from({ length: maxMana }).map((_, i) => (
            <ManaPoint 
              key={i} 
              active={i < mana}
              title={`Mana Crystal ${i + 1}`}
            />
          ))}
        </ManaBar>
        <Stats>
          <span>{mana} / {maxMana}</span>
          <span>{Math.round((mana / maxMana) * 100)}%</span>
        </Stats>
      </StatusSection>
    </Container>
  );
};

PlayerInfo.propTypes = {
  username: PropTypes.string,
  hp: PropTypes.number.isRequired,
  mana: PropTypes.number.isRequired,
  maxMana: PropTypes.number,
  status: PropTypes.oneOf(['active', 'inactive'])
};

PlayerInfo.defaultProps = {
  hp: 100,
  mana: 0,
  maxMana: 10
};

export default PlayerInfo;
