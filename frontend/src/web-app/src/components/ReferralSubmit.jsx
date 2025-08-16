import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #1f2937;
  border-radius: 0.5rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem 1rem;
  background: #374151;
  color: white;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.error ? '#ef4444' : 'transparent'};
  margin-right: 0.5rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #6366f1;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Button = styled.button`
  background: ${props => props.disabled ? '#4b5563' : '#2563eb'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.type === 'error' ? '#ef4444' : '#4ade80'};
`;

const ReferralSubmit = ({ userId }) => {
  const [referrerId, setReferrerId] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const validateInput = () => {
    if (!referrerId.trim()) {
      setMessage({ text: 'Please enter a referrer ID', type: 'error' });
      return false;
    }
    if (referrerId === userId) {
      setMessage({ text: 'Cannot refer yourself', type: 'error' });
      return false;
    }
    return true;
  };

  const submitReferral = async () => {
    if (!validateInput()) return;

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      const res = await axios.post('/api/league/add-referral', {
        referrerId: referrerId.trim(),
        referredUserId: userId
      });

      setMessage({ 
        text: '✨ ' + res.data.message, 
        type: 'success' 
      });
      setReferrerId('');

    } catch (err) {
      setMessage({ 
        text: '❌ ' + (err.response?.data?.message || 'Error submitting referral'), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>
        <span>🎯</span>
        <span>Enter Referral</span>
      </Title>

      <div>
        <Input
          type="text"
          value={referrerId}
          onChange={(e) => setReferrerId(e.target.value)}
          placeholder="Referrer's User ID"
          disabled={loading}
          error={message.type === 'error'}
        />
        <Button
          onClick={submitReferral}
          disabled={loading || !referrerId.trim()}
        >
          {loading ? '⏳ Submitting...' : 'Submit'}
        </Button>
      </div>

      {message.text && (
        <Message type={message.type}>
          {message.text}
        </Message>
      )}
    </Container>
  );
};

ReferralSubmit.propTypes = {
  userId: PropTypes.string.isRequired
};

export default ReferralSubmit;
