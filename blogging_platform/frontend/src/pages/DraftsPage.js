import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { posts } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DraftsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [draftPosts, setDraftPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/drafts' } });
      return;
    }

    const fetchDrafts = async () => {
      try {
        setLoading(true);
        const response = await posts.getDraftsSafe();
        
        if (response.success) {
          const draftsData = response.isPaginated ? response.data : response.data;
          setDraftPosts(draftsData);
          setError(null);
        } else {
          console.error('Failed to fetch drafts:', response.error);
          setError(response.error.message || 'Failed to load your draft posts. Please try again later.');
          setDraftPosts([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchDrafts function:', err);
        setError('Failed to load your draft posts. Please try again later.');
        setDraftPosts([]);
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [isAuthenticated, navigate]);

  const handleDeleteDraft = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    
    try {
      await posts.delete(slug);
      const response = await posts.getDraftsSafe();
      if (response.success) {
        const draftsData = response.isPaginated ? response.data : response.data;
        setDraftPosts(draftsData);
        setError(null);
      } else {
        setError('Failed to refresh drafts after deletion.');
      }
    } catch (err) {
      console.error('Error deleting draft:', err);
      setError('Failed to delete draft. Please try again later.');
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Drafts</h1>
        <Link to="/posts/new" className="btn btn-primary">
          <i className="fas fa-plus me-1"></i> Create New Post
        </Link>
      </div>
      
      {draftPosts.length === 0 ? (
        <div className="alert alert-info">
          You don't have any draft posts. <Link to="/posts/new">Create a post</Link> and save it as draft.
        </div>
      ) : (
        <>
          <div className="mb-3">
            <p className="text-muted">You have {draftPosts.length} {draftPosts.length === 1 ? 'draft' : 'drafts'}</p>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {draftPosts.map(draft => (
                  <tr key={draft.id}>
                    <td>
                      <Link to={`/posts/${draft.slug}`}>{draft.title || 'Untitled Draft'}</Link>
                    </td>
                    <td>{new Date(draft.updated_date).toLocaleString()}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Link 
                          to={`/posts/${draft.slug}/edit`} 
                          className="btn btn-outline-primary"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteDraft(draft.slug)}
                          className="btn btn-outline-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DraftsPage; 