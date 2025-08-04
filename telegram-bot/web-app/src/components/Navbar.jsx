import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user }) => {
  return (
    <nav className="bg-gray-900 text-white px-4 py-2 flex justify-between">
      <h1 className="text-xl font-bold">Mythic Warriors</h1>
      <div className="space-x-4">
        <Link to="/">Home</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/deck">Deck Builder</Link>
        <Link to="/battle">Battle</Link>
        <Link to="/league">League</Link>
        <Link to="/referral">Referral</Link>
        {user ? (
          <span>Welcome, {user.username}</span>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
