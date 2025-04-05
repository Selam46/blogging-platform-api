import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer text-center py-3">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="text-uppercase mb-3">About</h6>
            <p className="mb-0 small">
              BlogPlatform is a place to share your thoughts, stories, and ideas with the world.
            </p>
          </div>
          
          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="text-uppercase mb-3">Links</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-muted">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-decoration-none text-muted">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-decoration-none text-muted">Register</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-md-4">
            <h6 className="text-uppercase mb-3">Connect</h6>
            <div className="d-flex justify-content-center justify-content-md-start">
              <a href="https://github.com/Selam46" className="text-decoration-none me-3" aria-label="GitHub">
                <i className="bi bi-github fs-5"></i>
              </a>
              <a href="https://twiiter.com" className="text-decoration-none me-3" aria-label="Twitter">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="https://www.linkedin.com/in/selamawit-mesfin/" className="text-decoration-none" aria-label="LinkedIn">
                <i className="bi bi-linkedin fs-5"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-top pt-3 mt-3">
          <p className="text-muted small mb-0">
            &copy; {year} BlogPlatform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 