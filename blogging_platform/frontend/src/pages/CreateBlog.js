import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlog } from '../services/api';
import { useAuth } from '../services/AuthContext';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content should be at least 50 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
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
      setIsSubmitting(true);
      setSubmissionError(null);

      const blogData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        featured_image: formData.image || '',
        status: 'published',
        excerpt: formData.content.substring(0, 150) + '...' 
      };
      
      console.log('Submitting blog post:', blogData);
      
      const response = await createBlog(blogData);
      console.log('Create blog response:', response);
      
      if (response.data && response.data.slug) {
        navigate(`/blog/${response.data.slug}`);
      } else if (response.data && response.data.id) {
        navigate(`/blog/${response.data.id}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Error creating blog post:', err);
      console.error('Error response:', err.response?.data);
      
      setSubmissionError(
        err.response?.data?.detail || 
        err.response?.data?.error ||
        err.response?.data?.message || 
        'Failed to create blog post. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Create New Blog Post</h2>
            </div>
            
            <div className="card-body">
              {submissionError && (
                <div className="alert alert-danger" role="alert">
                  {submissionError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter blog title"
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                    className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select a category</option>
                    <option value="Technology">Technology</option>
                    <option value="Travel">Travel</option>
                    <option value="Food">Food</option>
                    <option value="Health">Health</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                  {errors.category && (
                    <div className="invalid-feedback">{errors.category}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Image URL (Optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
                  <div className="form-text">
                    Provide a URL to an image for your blog post
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Content</label>
                  <textarea
                    className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                    id="content"
                    name="content"
                    rows="10"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Write your blog content here..."
                  ></textarea>
                  {errors.content && (
                    <div className="invalid-feedback">{errors.content}</div>
                  )}
                </div>
                
                <div className="d-grid gap-2 mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Publishing...
                      </>
                    ) : 'Publish Blog Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog; 