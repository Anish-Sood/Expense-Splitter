import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Splitwise Logo" className="logo-img" />
          <span className="logo-text">SplitEase</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'} />
        </div>

        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          {!isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/" className="nav-links">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/login" className="nav-links">Login</Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/" className="nav-links">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/expenses" className="nav-links">Your Expenses</Link>
              </li>
              <li className="nav-item">
                <Link to="/groups" className="nav-links">Your Groups</Link>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-links logout-btn">Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
