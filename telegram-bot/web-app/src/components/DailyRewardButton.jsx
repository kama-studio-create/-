import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const RewardContainer = styled.div`
  margin-top: 1rem;
`;

const Button = styled.button`
  background: ${props => props.disabled ? '#4b5563' : '#eab308'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  width: 100%;
  max-width: 200px;

  &:hover:not(:disabled) {
    background: #ca8a04;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  color: ${props => props.type === 'error' ? '#ef4444' : '#22c55e'};
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Timer = styled.span`
  color: #9ca3af;
  font-size: 0.875rem;
`;

const DailyRewardButton = ({ userId }) => {
  const [claimed, setClaimed] = useState(false);
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextClaim, setNextClaim] = useState(null);

  useEffect(() => {
    checkClaimStatus();
  }, [userId]);

  const checkClaimStatus = async () => {
    try {
      const res = await axios.get(`/api/daily/status/${userId}`);
      setClaimed(res.data.claimed);
      setNextClaim(res.data.nextClaim);
    } catch (err) {
      setError('Failed to check reward status');
    }
  };

  const claimReward = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post('/api/daily/claim', { userId });
      
      setReward(res.data.gold);
      setClaimed(true);
      setNextClaim(res.data.nextClaim);

      // Optional: Update user's gold in parent component
      if (res.data.newBalance) {
        // onGoldUpdate?.(res.data.newBalance);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim reward');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = (nextClaimTime) => {
    if (!nextClaimTime) return '';
    const diff = new Date(nextClaimTime) - new Date();
    if (diff <= 0) return '';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <RewardContainer>
      {claimed ? (
        <>
          <Message type="success">
            <span>🎁</span>
            <span>Daily reward claimed! +{reward} Gold</span>
          </Message>
          {nextClaim && (
            <Timer>Next reward in: {formatTimeLeft(nextClaim)}</Timer>
          )}
        </>
      ) : error ? (
        <Message type="error">
          <span>❌</span>
          <span>{error}</span>
        </Message>
      ) : (
        <>
          <Button
            onClick={claimReward}
            disabled={loading || Boolean(nextClaim)}
          >
            {loading ? '⏳ Claiming...' : '🎁 Claim Daily Reward'}
          </Button>
          {nextClaim && (
            <Timer>Available in: {formatTimeLeft(nextClaim)}</Timer>
          )}
        </>
      )}
    </RewardContainer>
  );
};

export default DailyRewardButton;
