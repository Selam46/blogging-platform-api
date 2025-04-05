import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, isAuthenticated, logout, checkAuthStatus } = useAuth();
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  const navigate = useNavigate();
  
  const toggleAuthDropdown = () => {
    setShowAuthDropdown(!showAuthDropdown);
  };
  
  const toggleNavDropdown = () => {
    setShowNavDropdown(!showNavDropdown);
  };

  useEffect(() => {
    const closeDropdowns = () => {
      setShowAuthDropdown(false);
      setShowNavDropdown(false);
    };
    
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderNavLinks = () => {
    return (
      <>
        <li className="nav-item">
          <NavLink to="/" className="nav-link" end>Home</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/categories" className="nav-link">Categories</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/search" className="nav-link">Search</NavLink>
        </li>
        {isAuthenticated && (
          <>
            <li className="nav-item">
              <NavLink to="/posts/new" className="nav-link">New Post</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/my-posts" className="nav-link">My Posts</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/drafts" className="nav-link">Drafts</NavLink>
            </li>
          </>
        )}
      </>
    );
  };
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link to="/" className="navbar-brand">Blogging Platform</Link>
        
        {/* Mobile Toggle Button */}
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleNavDropdown}
          aria-expanded={showNavDropdown}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {}
        <div className={`collapse navbar-collapse ${showNavDropdown ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {renderNavLinks()}
          </ul>
          
          {}
          <div className="d-flex">
            {isAuthenticated ? (
              <div className="nav-item dropdown">
                <button 
                  className="btn btn-outline-light dropdown-toggle" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAuthDropdown();
                  }}
                  aria-expanded={showAuthDropdown}
                >
                  {currentUser?.username || 'Account'}
                </button>
                <ul className={`dropdown-menu dropdown-menu-end ${showAuthDropdown ? 'show' : ''}`}>
                  <li>
                    <span className="dropdown-item-text">
                      Signed in as <strong>{currentUser?.username}</strong>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link to="/my-posts" className="dropdown-item">My Posts</Link></li>
                  <li><Link to="/drafts" className="dropdown-item">My Drafts</Link></li>
                  <li><Link to="/debug" className="dropdown-item">Debug Tools</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item text-danger">
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex">
                <Link to="/login" className="btn btn-outline-light me-2">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 