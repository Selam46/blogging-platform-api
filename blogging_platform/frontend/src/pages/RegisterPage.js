import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, authError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await register(formData);
      console.log('Registration successful, redirecting to homepage');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);

      if (authError) {
        setErrors({ general: authError });
      } 

      else if (err.response?.data) {
        const serverErrors = err.response.data;
        const formattedErrors = {};

        if (typeof serverErrors === 'object') {
          Object.keys(serverErrors).forEach(key => {
            const errorValue = serverErrors[key];
            if (Array.isArray(errorValue)) {
              formattedErrors[key] = errorValue.join(', ');
            } else if (typeof errorValue === 'string') {
              formattedErrors[key] = errorValue;
            }
          });

          if (serverErrors.error) {
            formattedErrors.general = serverErrors.error;
          }
          
          setErrors(formattedErrors);
        } else if (typeof serverErrors === 'string') {
          setErrors({ general: serverErrors });
        } else {
          setErrors({ general: 'An unknown error occurred. Please try again.' });
        }
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm mt-5">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Register</h2>
              
              {errors.general && (
                <div className="alert alert-danger">{errors.general}</div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`} 
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password2" className="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    className={`form-control ${errors.password2 ? 'is-invalid' : ''}`} 
                    id="password2"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                  />
                  {errors.password2 && (
                    <div className="invalid-feedback">{errors.password2}</div>
                  )}
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
                        Registering...
                      </>
                    ) : 'Register'}
                  </button>
                </div>
              </form>
              
              <div className="mt-3 text-center">
                <p>Already have an account? <Link to="/login">Login</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 