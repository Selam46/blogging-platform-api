import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { posts } from '../services/api';
import apiTestUtils from '../services/apiTest';

const AuthDebugPage = () => {
  const { currentUser, isAuthenticated, logout, forceLogout, fixAuthState } = useAuth();
  const [token, setToken] = useState('');
  const [testResponse, setTestResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawUserData, setRawUserData] = useState('');
  
  // Simple post form for testing
  const [testPost, setTestPost] = useState({
    title: 'Test Post ' + new Date().toISOString().substring(0, 16),
    content: 'This is a test post created from the debug page.',
    category: '1', // Default to first category
    status: 'draft'
  });

  const isTokenInvalid = () => {
    const token = localStorage.getItem('token');
    return token && (token.length < 20 || token.startsWith('dummy'));
  };

  const updateAuthInfo = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    setToken(storedToken || 'No token found');
    setRawUserData(storedUser || 'No user data found');
  };

  useEffect(() => {
    updateAuthInfo();
    window.addEventListener('storage', updateAuthInfo);
    return () => window.removeEventListener('storage', updateAuthInfo);
  }, []);
  
  const runApiTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiTestUtils.runApiDiagnostic();
      setTestResponse(result);
    } catch (err) {
      console.error('API test error:', err);
      setError('API test failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const createTestPost = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Sending test post with data:', testPost);
      const result = await posts.createSafe(testPost);
      setTestResponse(result);
      
      if (result.success) {
        setTestPost({
          ...testPost,
          title: 'Test Post ' + new Date().toISOString().substring(0, 16)
        });
      }
    } catch (err) {
      console.error('Create test post error:', err);
      setError('Create test post failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mt-4">
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Authentication Debug Tool</h4>
        </div>
        <div className="card-body">
          <h5>Authentication Status</h5>
          <div className={`alert ${isTokenInvalid() ? 'alert-warning' : 'alert-info'}`}>
            <p>
              <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'} 
              {isAuthenticated !== !!localStorage.getItem('token') && 
                <span className="badge bg-danger ms-2">State Mismatch!</span>
              }
            </p>
            {currentUser && (
              <p><strong>Current User:</strong> {currentUser.username || JSON.stringify(currentUser)}</p>
            )}
            <p>
              <strong>Token:</strong> {token ? (token.length > 20 ? token.substring(0, 20) + '...' : token) : 'None'}
              {isTokenInvalid() && <span className="badge bg-warning ms-2">Invalid Token</span>}
            </p>
            
            {!currentUser && token && (
              <div className="mt-2 alert alert-danger">
                <strong>ERROR:</strong> You have a token but no user state! This inconsistency needs to be fixed.
                <div className="mt-2">
                  <button 
                    className="btn btn-warning btn-sm"
                    onClick={() => {
                      if (fixAuthState()) {
                        window.location.reload();
                      } else {
                        setError('Failed to fix auth state. Try logging out and back in.');
                      }
                    }}
                  >
                    Fix Authentication State
                  </button>
                </div>
              </div>
            )}
            
            {isTokenInvalid() && (
              <div className="mt-2 alert alert-warning">
                <strong>WARNING:</strong> Your token appears to be invalid or a placeholder. 
                This will prevent you from making authenticated API requests.
              </div>
            )}
          </div>
          
          {/* Raw localStorage Data */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Raw localStorage Data</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Token:</h6>
                  <div className="border p-2 bg-light mb-3" style={{ wordBreak: 'break-all' }}>
                    {token || 'No token found'}
                  </div>
                </div>
                <div className="col-md-6">
                  <h6>User Data:</h6>
                  <div className="border p-2 bg-light mb-3">
                    <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {rawUserData || 'No user data found'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-flex gap-2 mb-4">
            {isAuthenticated ? (
              <>
                <button 
                  className="btn btn-danger" 
                  onClick={logout}
                >
                  Logout
                </button>
                <button 
                  className="btn btn-warning" 
                  onClick={() => {
                    forceLogout();
                    window.location.reload();
                  }}
                >
                  Force Logout (Clear Invalid Token)
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={() => {
                    if (fixAuthState()) {
                      window.location.reload();
                    } else {
                      setError('Failed to fix auth state. Try logging out and back in.');
                    }
                  }}
                >
                  Fix Auth State
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary" state={{ from: '/debug' }}>Login</Link>
            )}
            <Link to="/register" className="btn btn-outline-primary">Register</Link>
          </div>
          
          {/* Token Management */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Token Management</h5>
            </div>
            <div className="card-body">
              <p>If you're having authentication issues, you can:</p>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    updateAuthInfo();
                    window.location.reload();
                  }}
                >
                  Clear Token & User Data
                </button>
                <Link 
                  to="/login" 
                  state={{ from: '/debug' }} 
                  className="btn btn-primary btn-sm"
                >
                  Go to Login Page
                </Link>
              </div>
            </div>
          </div>
          
          {/* API Test */}
          <h5>API Test</h5>
          <button 
            className="btn btn-info mb-3"
            onClick={runApiTest}
            disabled={loading}
          >
            {loading ? 'Running Tests...' : 'Run API Diagnostic'}
          </button>
          
          {/* Test Post Form */}
          <h5>Create Test Post</h5>
          {!isAuthenticated || isTokenInvalid() ? (
            <div className="alert alert-warning">
              <strong>Authentication Required:</strong> You need to be logged in with a valid token to create posts.
              <div className="mt-2">
                <Link to="/login" state={{ from: '/debug' }} className="btn btn-primary btn-sm">
                  Login Now
                </Link>
              </div>
            </div>
          ) : (
            <form className="mb-3" onSubmit={(e) => { e.preventDefault(); createTestPost(); }}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={testPost.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="content" className="form-label">Content</label>
                <textarea
                  className="form-control"
                  id="content"
                  name="content"
                  rows="3"
                  value={testPost.content}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="category" className="form-label">Category ID</label>
                <input
                  type="text"
                  className="form-control"
                  id="category"
                  name="category"
                  value={testPost.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="status"
                    id="statusDraft"
                    value="draft"
                    checked={testPost.status === 'draft'}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="statusDraft">
                    Draft
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="status"
                    id="statusPublished"
                    value="published"
                    checked={testPost.status === 'published'}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="statusPublished">
                    Published
                  </label>
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Test Post'}
              </button>
            </form>
          )}
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <h5>Error:</h5>
          <p>{error}</p>
        </div>
      )}
      
      {testResponse && (
        <div className="card">
          <div className="card-header bg-secondary text-white">
            <h5 className="mb-0">Test Response</h5>
          </div>
          <div className="card-body">
            <h6>Status: {testResponse.success ? 'Success' : 'Failed'}</h6>
            <div className="border rounded p-3 bg-light">
              <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugPage; 