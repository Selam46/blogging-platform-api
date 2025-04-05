import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { posts, categories, tags } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostFormPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, forceLogout, refreshToken } = useAuth();
  const isEditMode = !!slug;
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    category: '',
    tag_names: '',
    status: 'draft'
  });
  
  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: isEditMode ? `/posts/${slug}/edit` : '/posts/new' } });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found despite isAuthenticated being true');
      setError('Authentication token missing. Please log in again.');
      return;
    }
    
    console.log('User authenticated with token:', token);

    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, tagsResponse] = await Promise.all([
          categories.getAllPaginated(),
          tags.getAllPaginated()
        ]);
        
        console.log('Categories response:', categoriesResponse);
        console.log('Tags response:', tagsResponse);
        if (categoriesResponse.success) {
          setAllCategories(categoriesResponse.data || []);
        } else {
          console.error('Error fetching categories:', categoriesResponse.error);
          setAllCategories([]);
        }

        if (tagsResponse.success) {
          setAllTags(tagsResponse.data || []);
        } else {
          console.error('Error fetching tags:', tagsResponse.error);
          setAllTags([]);
        }

        if (isEditMode) {
          const postResponse = await posts.getById(slug);
          const post = postResponse.data;
          
          setFormData({
            title: post.title || '',
            content: post.content || '',
            excerpt: post.excerpt || '',
            featured_image: post.featured_image || '',
            category: post.category || '',
            tag_names: post.tags_detail ? post.tags_detail.map(tag => tag.name).join(', ') : '',
            status: post.status || 'draft'
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load form data. Please try again later.');
        setAllCategories([]);
        setAllTags([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, isEditMode, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Authentication required. Please log in again.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      navigate('/login', { state: { from: isEditMode ? `/posts/${slug}/edit` : '/posts/new' } });
      return;
    }

    setSubmitLoading(true);
    setError(null);
    
    try {
      console.log('Submitting form data:', formData);

      const requiredFields = {
        title: 'Title is required',
        content: 'Content is required',
        category: 'Please select a category'
      };
      
      for (const [field, message] of Object.entries(requiredFields)) {
        if (!formData[field]?.toString().trim()) {
          setError(message);
          setSubmitLoading(false);
          return;
        }
      }

      const cleanedData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        status: formData.status || 'draft'
      };

      if (formData.excerpt?.trim()) {
        cleanedData.excerpt = formData.excerpt.trim();
      }
      
      if (formData.featured_image?.trim()) {
        cleanedData.featured_image = formData.featured_image.trim();
      }

      if (formData.category) {
        cleanedData.category = parseInt(formData.category, 10);
      }

      if (formData.tag_names?.trim()) {
        cleanedData.tag_names = formData.tag_names.trim();
      }
      
      console.log('Cleaned submission data:', cleanedData);

      console.log('Current token format:', token.substring(0, 10) + '...');
      if (token.startsWith('Token ')) {
        console.log('Token already has Token prefix');
      } else {
        console.log('Token does not have Token prefix');
      }

      try {
        await refreshToken();
        console.log('Token refreshed successfully');
      } catch (tokenError) {
        console.error('Token refresh failed, continuing with existing token:', tokenError);
      }
      
      let result;
      if (isEditMode) {
        console.log(`Updating post with slug: ${slug}`);
        result = await posts.updateSafe(slug, cleanedData);
      } else {
        console.log('Creating new post');
        result = await posts.createSafe(cleanedData);
      }
      
      console.log('API result:', result);
      
      if (result.success) {
        const postSlug = isEditMode ? slug : result.data.slug;
        console.log(`Post ${isEditMode ? 'updated' : 'created'} successfully with slug: ${postSlug}`);
        navigate(`/posts/${postSlug}`);
      } else {
        console.error(`Failed to ${isEditMode ? 'update' : 'create'} post:`, result.error);

        if (result.error.status === 401 || result.error.status === 403) {
          setError('Your session has expired. Please log in again.');
          forceLogout();
          navigate('/login', { state: { from: isEditMode ? `/posts/${slug}/edit` : '/posts/new' } });
        } else {
          let errorMsg = result.error.message || `Failed to ${isEditMode ? 'update' : 'create'} post.`;
          
          if (result.error.details) {
            let detailsStr = '';
            if (typeof result.error.details === 'string') {
              detailsStr = result.error.details;
            } else if (typeof result.error.details === 'object') {
              detailsStr = Object.entries(result.error.details)
                .map(([field, errors]) => {
                  if (Array.isArray(errors)) {
                    return `${field}: ${errors.join(', ')}`;
                  } else {
                    return `${field}: ${errors}`;
                  }
                })
                .join('; ');
            } else {
              detailsStr = JSON.stringify(result.error.details);
            }
            errorMsg += ` Details: ${detailsStr}`;
          }
          
          setError(errorMsg);
          setSubmitLoading(false);
        }
      }
    } catch (err) {
      console.error('Unexpected error saving post:', err);
      setError(`Something went wrong. Please try again. Error: ${err.message}`);
      setSubmitLoading(false);
    }
  };


  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="mb-4">{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
          
          {/* Display error if any */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title*</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Content */}
            <div className="mb-3">
              <label htmlFor="content" className="form-label">Content*</label>
              <textarea
                className="form-control"
                id="content"
                name="content"
                rows="10"
                value={formData.content}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            {/* Excerpt */}
            <div className="mb-3">
              <label htmlFor="excerpt" className="form-label">Excerpt</label>
              <textarea
                className="form-control"
                id="excerpt"
                name="excerpt"
                rows="3"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="A short summary of your post"
              ></textarea>
            </div>
            
            {/* Featured Image */}
            <div className="mb-3">
              <label htmlFor="featured_image" className="form-label">Featured Image URL</label>
              <input
                type="url"
                className="form-control"
                id="featured_image"
                name="featured_image"
                value={formData.featured_image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.featured_image && (
                <div className="mt-2">
                  <img 
                    src={formData.featured_image} 
                    alt="Preview" 
                    className="img-thumbnail" 
                    style={{ maxHeight: '200px' }} 
                  />
                </div>
              )}
            </div>
            
            {/* Category */}
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Category*</label>
              <select
                className="form-select"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {Array.isArray(allCategories) && allCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tags */}
            <div className="mb-3">
              <label htmlFor="tag_names" className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="form-control"
                id="tag_names"
                name="tag_names"
                value={formData.tag_names}
                onChange={handleChange}
                placeholder="technology, programming, web"
              />
              <div className="form-text">
                Existing tags: {Array.isArray(allTags) ? allTags.map(tag => tag.name).join(', ') : ''}
              </div>
            </div>
            
            {/* Status */}
            <div className="mb-3">
              <label className="form-label d-block">Status</label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="status"
                  id="statusDraft"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="statusDraft">Draft</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="status"
                  id="statusPublished"
                  value="published"
                  checked={formData.status === 'published'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="statusPublished">Published</label>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="d-flex justify-content-between mt-4">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  isEditMode ? 'Update Post' : 'Create Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostFormPage; 