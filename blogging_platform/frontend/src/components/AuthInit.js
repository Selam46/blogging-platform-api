import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthInit = () => {
  const { checkAuthStatus, fixAuthState, refreshToken, isAuthenticated } = useAuth();
  
  useEffect(() => {
    const authOk = checkAuthStatus();
    if (!authOk) {
      console.log('Authentication state appears inconsistent, attempting to fix...');
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        console.log('Found authentication data in localStorage, repairing state...');
        fixAuthState();
      } else {
        console.log('No valid authentication data found in localStorage');
      }
    } else {
      console.log('Authentication state is valid');
      if (isAuthenticated) {
        console.log('User is authenticated, refreshing token...');
        refreshToken().then(success => {
          console.log('Token refresh result:', success ? 'success' : 'failed');
        }).catch(err => {
          console.error('Error refreshing token:', err);
        });
      }
    }
  }, [checkAuthStatus, fixAuthState, refreshToken, isAuthenticated]);
  return null;
};

export default AuthInit; 