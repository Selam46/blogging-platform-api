import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Header = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <span style={{ color: '#5048E5' }}>Blog</span>Platform
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/create-blog">Create Post</Link>
              </li>
            )}
          </ul>
          
          <div className="d-flex">
            {isAuthenticated ? (
              <div className="dropdown">
                <button 
                  className="btn dropdown-toggle" 
                  type="button" 
                  id="dropdownMenuButton" 
                  data-bs-toggle="dropdown"
                >
                  {currentUser?.username || 'User'}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">Profile</Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                         Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div>
                <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header; 