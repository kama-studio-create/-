import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import styled from 'styled-components';

const FormContainer = styled.div`
  background: #111827;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-top: 1.5rem;
  color: white;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 1rem;
  background: #374151;
  border-radius: 0.375rem;
  color: white;
  border: 1px solid ${props => props.error ? '#ef4444' : 'transparent'};
  margin-bottom: 0.5rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #6366f1;
  }

  option {
    background: #374151;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 1rem;
  background: #374151;
  border-radius: 0.375rem;
  color: white;
  border: 1px solid ${props => props.error ? '#ef4444' : 'transparent'};
  margin-bottom: 1rem;
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
  background: ${props => props.disabled ? '#4b5563' : '#059669'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #047857;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  margin-top: 0.75rem;
  color: ${props => props.type === 'error' ? '#ef4444' : '#fbbf24'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ListCardForm = ({ userId }) => {
  const [ownedCards, setOwnedCards] = useState([]);
  const [price, setPrice] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOwnedCards();
  }, [userId]);

  const fetchOwnedCards = async () => {
    try {
      const res = await axios.get(`/api/cards/user/${userId}`);
      setOwnedCards(res.data);
    } catch (err) {
      setMessage({ 
        text: 'Failed to fetch cards', 
        type: 'error' 
      });
    }
  };

  const validateForm = () => {
    if (!selectedCard) {
      setMessage({ text: 'Please select a card', type: 'error' });
      return false;
    }
    if (!price || price <= 0) {
      setMessage({ text: 'Please enter a valid price', type: 'error' });
      return false;
    }
    return true;
  };

  const listCard = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      const res = await axios.post('/api/marketplace/list', {
        userId,
        cardId: selectedCard,
        price: Number(price)
      });

      setMessage({ text: '✅ ' + res.data.message, type: 'success' });
      setPrice('');
      setSelectedCard('');
      
      // Refresh owned cards
      fetchOwnedCards();

    } catch (err) {
      setMessage({ 
        text: '❌ ' + (err.response?.data?.message || 'Error listing card'), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Title>
        <span>📤</span>
        <span>List a Card</span>
      </Title>

      <Select
        value={selectedCard}
        onChange={(e) => setSelectedCard(e.target.value)}
        disabled={loading}
        error={message.type === 'error' && !selectedCard}
      >
        <option value="">-- Select Card --</option>
        {ownedCards.map((card) => (
          <option key={card._id} value={card._id}>
            {card.name} ({card.rarity})
          </option>
        ))}
      </Select>

      <Input
        type="number"
        placeholder="Price (tokens)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        disabled={loading}
        error={message.type === 'error' && !price}
        min="0"
      />

      <Button 
        onClick={listCard}
        disabled={loading || !selectedCard || !price}
      >
        {loading ? '⏳ Listing...' : '📝 List Card'}
      </Button>

      {message.text && (
        <Message type={message.type}>
          {message.text}
        </Message>
      )}
    </FormContainer>
  );
};

ListCardForm.propTypes = {
  userId: PropTypes.string.isRequired
};

export default ListCardForm;
