import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    console.log('AuthContext initializing...');
    const authValid = checkAuthStatus();
    console.log('Initial auth status:', authValid ? 'Authenticated' : 'Not authenticated');
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials) => {
    try {
      setAuthError(null);
      console.log('Attempting login with:', credentials.username);
      const response = await auth.login(credentials);
      console.log('Login API response:', response);

      if (!response || !response.data) {
        console.error('Invalid response format:', response);
        setAuthError('Authentication failed: Server returned an invalid response');
        throw new Error('Invalid server response');
      }
      
      const { token, user } = response.data;

      if (!token) {
        console.error('No token received in login response');
        setAuthError('Authentication failed: No token received');
        throw new Error('No authentication token received');
      }

      if (token.includes('dummy') || token.length < 10) {
        console.error('Invalid token received:', token);
        setAuthError('Authentication failed: Invalid token received');
        throw new Error('Invalid authentication token received');
      }
      
      console.log('Login successful, token received and validated');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';

      if (error.response) {
        console.error('Server response error:', error.response);
        console.error('Status code:', error.response.status);
        console.error('Response data:', error.response.data);

        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (typeof error.response.data === 'object') {
            const fieldErrors = [];
            Object.entries(error.response.data).forEach(([field, errors]) => {
              if (Array.isArray(errors)) {
                fieldErrors.push(`${field}: ${errors.join(', ')}`);
              } else if (typeof errors === 'string') {
                fieldErrors.push(`${field}: ${errors}`);
              }
            });
            
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('; ');
            } else if (error.response.data.detail) {
              errorMessage = error.response.data.detail;
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            }
          }
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        console.error('Error during request setup:', error.message);
        errorMessage = `Request error: ${error.message}`;
      }
      
      setAuthError(errorMessage);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setAuthError(null);
      console.log('Registering user:', userData.username);
      const response = await auth.register(userData);
      console.log('Registration API response:', response);

      if (!response || !response.data) {
        console.error('Invalid response format:', response);
        setAuthError('Registration failed: Server returned an invalid response');
        throw new Error('Invalid server response');
      }
      
      const { token, user } = response.data;

      if (!token) {
        console.error('No token received in registration response');
        setAuthError('Registration failed: No token received');
        throw new Error('No authentication token received');
      }

      if (token.includes('dummy') || token.length < 10) {
        console.error('Invalid token received:', token);
        setAuthError('Registration failed: Invalid token received');
        throw new Error('Invalid authentication token received');
      }
      
      console.log('Registration successful, token received and validated');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response) {
        console.error('Server response error:', error.response);
        console.error('Status code:', error.response.status);
        console.error('Response data:', error.response.data);

        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (typeof error.response.data === 'object') {
            const fieldErrors = [];
            Object.entries(error.response.data).forEach(([field, errors]) => {
              if (Array.isArray(errors)) {
                fieldErrors.push(`${field}: ${errors.join(', ')}`);
              } else if (typeof errors === 'string') {
                fieldErrors.push(`${field}: ${errors}`);
              }
            });
            
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('; ');
            } else if (error.response.data.detail) {
              errorMessage = error.response.data.detail;
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            }
          }
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        console.error('Error during request setup:', error.message);
        errorMessage = `Request error: ${error.message}`;
      }
      
      setAuthError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      await auth.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      console.log('Logout successful, auth data cleared');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      console.log('Logout completed with errors, auth data cleared anyway');
    }
  };
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token) {
      if (currentUser) {
        console.warn('Auth inconsistency: User is set but no token exists');
        setCurrentUser(null);
      }
      return false;
    }

    if (token.includes('dummy_toke')) {
      console.warn('Invalid dummy token detected, clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      return false;
    }

    if (!currentUser && user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser && typeof parsedUser === 'object') {
          setCurrentUser(parsedUser);
          return true;
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }
    
    return !!token && !!currentUser;
  };
  const refreshToken = async () => {
    try {
      console.log('Attempting to refresh token...');
      const response = await auth.refreshToken();
      
      if (response.data?.token) {
        const newToken = response.data.token;
        const user = response.data.user;
        
        console.log('Token refreshed successfully');
        localStorage.setItem('token', newToken);
        
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          setCurrentUser(user);
        }
        
        return true;
      } else {
        console.error('Failed to refresh token: No token in response');
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  const forceLogout = () => {
    console.log('Forcing logout and clearing auth state');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setAuthError(null);
  };
  const fixAuthState = () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        console.warn('Cannot fix auth state: Missing token or user data');
        return false;
      }
      
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      console.log('Auth state manually fixed, user set to:', parsedUser);
      return true;
    } catch (e) {
      console.error('Failed to fix auth state:', e);
      return false;
    }
  };

  const contextValue = {
    currentUser,
    login,
    register,
    logout,
    forceLogout,
    refreshToken,
    fixAuthState,
    authError,
    checkAuthStatus,
    isAuthenticated: !!currentUser && !!localStorage.getItem('token')
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 