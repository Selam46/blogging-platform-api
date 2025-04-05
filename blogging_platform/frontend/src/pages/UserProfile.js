import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/api';
import { useAuth } from '../services/AuthContext';

const UserProfile = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { currentUser, isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: ''
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getUserProfile();
        const profileData = response.data;
        
        setProfile(profileData);
        setOriginalProfile(profileData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    if (success) {
      setSuccess(null);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setProfile(originalProfile);
      setErrors({});
    }
    
    setIsEditing(!isEditing);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (profile.avatar && !/^(ftp|http|https):\/\/[^ "]+$/.test(profile.avatar)) {
      newErrors.avatar = 'Avatar must be a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      await updateUserProfile(profile);

      setOriginalProfile(profile);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(
        err.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="mb-0">Your Profile</h2>
              <button 
                className={`btn btn-${isEditing ? 'secondary' : 'primary'}`}
                onClick={handleEditToggle}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              
              <div className="text-center mb-4">
                <img 
                  src={profile.avatar || 'https://via.placeholder.com/150x150?text=User'} 
                  alt={profile.username}
                  className="rounded-circle"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    id="username"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="mb-3">
                    <label htmlFor="avatar" className="form-label">Avatar URL</label>
                    <input
                      type="url"
                      className={`form-control ${errors.avatar ? 'is-invalid' : ''}`}
                      id="avatar"
                      name="avatar"
                      value={profile.avatar || ''}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    {errors.avatar && (
                      <div className="invalid-feedback">{errors.avatar}</div>
                    )}
                    <div className="form-text">
                      Enter a URL for your profile picture
                    </div>
                  </div>
                )}
                
                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <textarea
                    className="form-control"
                    id="bio"
                    name="bio"
                    rows="4"
                    value={profile.bio || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Tell us about yourself..." : "No bio provided"}
                  ></textarea>
                </div>
                
                {isEditing && (
                  <div className="d-grid gap-2 mt-4">
                    <button 
                      type="submit" 
                      className="btn btn-success" 
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 