import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  padding: 1rem;
  background: #111827;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
`;

const Name = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBar = styled.div`
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
  background: ${props => props.hp > 50 ? '#ef4444' : props.hp > 25 ? '#f97316' : '#dc2626'};
  width: ${props => props.hp}%;
  transition: all 0.3s ease-in-out;

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

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #9ca3af;
`;

const EnemyInfo = ({ name, hp, level, status }) => {
  return (
    <Container>
      <Name>
        {status === 'elite' && '⭐'} 
        {name || 'Enemy'} 
        {level && <span className="text-gray-400 text-sm">Lvl {level}</span>}
      </Name>

      <StatusBar>
        <Label>
          <span>HP</span>
          <span>{hp} / 100</span>
        </Label>
        <HealthBar>
          <HealthFill hp={hp} />
        </HealthBar>
      </StatusBar>

      <Stats>
        {status && (
          <span>
            {status === 'elite' ? '⭐ Elite' : 
             status === 'boss' ? '👑 Boss' : 
             '👤 Normal'}
          </span>
        )}
      </Stats>
    </Container>
  );
};

EnemyInfo.propTypes = {
  name: PropTypes.string,
  hp: PropTypes.number.isRequired,
  level: PropTypes.number,
  status: PropTypes.oneOf(['normal', 'elite', 'boss'])
};

EnemyInfo.defaultProps = {
  hp: 100,
  status: 'normal'
};

export default EnemyInfo;
