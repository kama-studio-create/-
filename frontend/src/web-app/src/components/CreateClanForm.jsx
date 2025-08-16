import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

// Constants
const CLAN_NAME_MIN_LENGTH = 3;
const CLAN_NAME_MAX_LENGTH = 20;
const CLAN_NAME_PATTERN = /^[a-zA-Z0-9\s-_]+$/;

const FormContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #1a1b3a;
  border-radius: 8px;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: #2d2f63;
  color: white;
  border: 1px solid ${props => props.error ? '#ff4444' : 'transparent'};
  flex: 1;
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
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  background: ${props => props.disabled ? '#4b5563' : '#10b981'};
  color: white;
  font-weight: 600;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  margin-top: 0.5rem;
  color: ${props => props.type === 'error' ? '#ff4444' : '#4ade80'};
  font-size: 0.875rem;
`;

const CreateClanForm = ({ userId, onCreated }) => {
  const [clanName, setClanName] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const validateClanName = (name) => {
    if (name.length < CLAN_NAME_MIN_LENGTH) {
      return `Clan name must be at least ${CLAN_NAME_MIN_LENGTH} characters`;
    }
    if (name.length > CLAN_NAME_MAX_LENGTH) {
      return `Clan name cannot exceed ${CLAN_NAME_MAX_LENGTH} characters`;
    }
    if (!CLAN_NAME_PATTERN.test(name)) {
      return 'Clan name can only contain letters, numbers, spaces, and hyphens';
    }
    return '';
  };

  const handleCreate = async () => {
    const error = validateClanName(clanName);
    if (error) {
      setMessage({ text: error, type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      const res = await axios.post('/api/clans/create', { 
        userId, 
        clanName: clanName.trim() 
      });

      setMessage({ 
        text: `✨ Clan "${res.data.name}" created successfully!`, 
        type: 'success' 
      });
      setClanName('');
      onCreated();

    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to create clan', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Title>
        <span>➕</span>
        <span>Create a Clan</span>
      </Title>

      <div className="flex gap-2">
        <Input
          type="text"
          value={clanName}
          onChange={(e) => setClanName(e.target.value)}
          placeholder="Enter clan name..."
          disabled={loading}
          error={message.type === 'error'}
          maxLength={CLAN_NAME_MAX_LENGTH}
        />
        <Button
          onClick={handleCreate}
          disabled={loading || !clanName.trim()}
        >
          {loading ? '⏳ Creating...' : 'Create'}
        </Button>
      </div>

      {message.text && (
        <Message type={message.type}>
          {message.text}
        </Message>
      )}
    </FormContainer>
  );
};

export default CreateClanForm;
