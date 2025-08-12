import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  background: #111827;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #6366f1;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: ${props => props.active ? '#6366f1' : '#9ca3af'};
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s;
  padding: 0.5rem;
  border-radius: 0.375rem;

  &:hover {
    color: #fff;
    background: #1f2937;
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  color: #fff;
  background: #374151;
  border-radius: 0.375rem;
  transition: all 0.2s;

  &:hover {
    background: #4b5563;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background: #1f2937;
  border-radius: 0.375rem;
  padding: 0.5rem;
  min-width: 200px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 50;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  color: #9ca3af;
  width: 100%;
  border-radius: 0.25rem;

  &:hover {
    background: #374151;
    color: #fff;
  }
`;

const Navbar = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Nav>
      <Link to="/">
        <Logo>
          <span>⚔️</span> 
          Mythic Warriors
        </Logo>
      </Link>

      <NavLinks>
        <NavLink to="/" active={isActive('/')}>
          🏠 Home
        </NavLink>
        <NavLink to="/marketplace" active={isActive('/marketplace')}>
          🏪 Marketplace
        </NavLink>
        <NavLink to="/deck" active={isActive('/deck')}>
          🎴 Deck Builder
        </NavLink>
        <NavLink to="/battle" active={isActive('/battle')}>
          ⚔️ Battle
        </NavLink>
        <NavLink to="/league" active={isActive('/league')}>
          🏆 League
        </NavLink>
        <NavLink to="/referral" active={isActive('/referral')}>
          👥 Referral
        </NavLink>

        {user ? (
          <UserMenu onMouseLeave={() => setShowDropdown(false)}>
            <UserButton 
              onClick={() => setShowDropdown(!showDropdown)}
              onMouseEnter={() => setShowDropdown(true)}
            >
              <span>👤</span>
              {user.username}
              <span>▼</span>
            </UserButton>

            {showDropdown && (
              <Dropdown>
                <DropdownItem to="/profile">
                  <span>👤</span> Profile
                </DropdownItem>
                <DropdownItem to="/inventory">
                  <span>🎒</span> Inventory
                </DropdownItem>
                <DropdownItem to="/settings">
                  <span>⚙️</span> Settings
                </DropdownItem>
                <DropdownItem to="/logout" style={{ color: '#ef4444' }}>
                  <span>🚪</span> Logout
                </DropdownItem>
              </Dropdown>
            )}
          </UserMenu>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </NavLinks>
    </Nav>
  );
};

export default Navbar;
