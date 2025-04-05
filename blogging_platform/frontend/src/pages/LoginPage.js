import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError, isAuthenticated, checkAuthStatus, fixAuthState } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const from = location.state?.from || '/';

  useEffect(() => {
    const isLoggedIn = checkAuthStatus();
    console.log('Login page loaded. Auth status:', isLoggedIn);
    
    if (isLoggedIn) {
      console.log('User is already authenticated, redirecting to:', from);
      navigate(from);
    }
  }, [isAuthenticated, checkAuthStatus, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Submitting login form with username:', formData.username);
      const user = await login(formData);
      console.log('Login successful, user:', user);

      const token = localStorage.getItem('token');
      console.log('Token stored in localStorage:', token ? `${token.substring(0, 10)}...` : 'No token!');

      setTimeout(() => {
        const isLoggedIn = checkAuthStatus();
        console.log('Auth status after login:', isLoggedIn);
        
        if (!isLoggedIn) {
          console.log('Login succeeded but auth status is still false. Attempting to fix...');
          
          const fixed = fixAuthState();
          if (fixed) {
            console.log('Auth state fixed. Redirecting to:', from);
            navigate(from);
          } else {
            console.error('Could not fix auth state despite successful login');
            setError('Login succeeded but could not establish authentication. Please try again or clear your browser cache.');
            setLoading(false);
          }
        } else {
          console.log('Redirecting to:', from);
          navigate(from);
        }
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Invalid username or password';
      
      if (authError) {
        errorMessage = authError;
      } else if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          const keys = Object.keys(err.response.data);
          if (keys.length > 0) {
            const values = keys.map(key => {
              const val = err.response.data[key];
              return `${key}: ${Array.isArray(val) ? val.join(', ') : val}`;
            });
            errorMessage = values.join('; ');
          }
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm mt-5">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Login</h2>
              
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : 'Login'}
                  </button>
                </div>
              </form>
              
              <div className="mt-3 text-center">
                <p>Don't have an account? <Link to="/register">Register</Link></p>
              </div>
              
              {/* Debug Section */}
              <div className="mt-4 text-muted border-top pt-3">
                <p className="small">Debug Information:</p>
                <ul className="small">
                  <li>Auth Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</li>
                  <li>Redirect Destination: {from}</li>
                  <li>Token Present: {localStorage.getItem('token') ? 'Yes' : 'No'}</li>
                </ul>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    console.log('Current auth state:', {
                      isAuthenticated,
                      token: localStorage.getItem('token'),
                      user: localStorage.getItem('user')
                    });
                  }}
                >
                  Log Auth Debug Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 