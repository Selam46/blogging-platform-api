import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
      setCurrentUser(JSON.parse(user));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Logging in with:', { username, password });
      
      const response = await api.login({ username, password });
      console.log('Login response:', response);
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setCurrentUser(response.data.user);
        navigate('/');
        return true;
      } else if (response.data && response.data.key) {
        const token = response.data.key;
        localStorage.setItem('token', token);
        
        // Get user info
        try {
          const userResponse = await api.getUserProfile();
          localStorage.setItem('user', JSON.stringify(userResponse.data));
          setCurrentUser(userResponse.data);
        } catch (userErr) {
          console.error('Error fetching user data:', userErr);
        }
        
        navigate('/');
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(
          err.response.data.error || 
          err.response.data.detail || 
          err.response.data.non_field_errors?.[0] ||
          'Login failed. Please check your credentials.'
        );
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        setError('Login failed. Please try again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Registering with data:', userData);
      
      const response = await api.register(userData);
      console.log('Registration response:', response);
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setCurrentUser(response.data.user);
        navigate('/');
        return true;
      }

      if (response.status === 201 || response.status === 200) {
        return await login(userData.username, userData.password1);
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);

        const responseData = err.response.data;
        if (typeof responseData === 'object') {
          const errorMessage = Object.keys(responseData)
            .map(key => {
              const value = responseData[key];
              if (Array.isArray(value)) {
                return `${key}: ${value.join(' ')}`;
              }
              return `${key}: ${value}`;
            })
            .join('\n');
          
          setError(errorMessage || 'Registration failed. Please check your information.');
        } else {
          setError(
            err.response.data.error ||
            err.response.data.detail || 
            err.response.data.message || 
            'Registration failed. Please check your information and try again.'
          );
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please check your connection and try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const value = {
    currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 