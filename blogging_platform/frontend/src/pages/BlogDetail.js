import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBlogById, getComments, addComment, deleteBlog } from '../services/api';
import { useAuth } from '../services/AuthContext';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlogAndComments = async () => {
      try {
        setLoading(true);
        const blogResponse = await getBlogById(id);
        setBlog(blogResponse.data);
        
        const commentsResponse = await getComments(id);
        setComments(commentsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching blog data:', err);
        setError('Failed to load the blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAndComments();
  }, [id]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    try {
      setSubmitting(true);
      const response = await addComment(id, { content: newComment });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await deleteBlog(id);
        navigate('/');
      } catch (err) {
        console.error('Error deleting blog:', err);
        alert('Failed to delete the blog post. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container py-5 text-center">
        <h2>Blog post not found</h2>
        <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
      </div>
    );
  }

  const isAuthor = isAuthenticated && currentUser && blog.author.id === currentUser.id;

  return (
    <div className="blog-detail">
      <div className="container">
        {/* Blog Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold">{blog.title}</h1>
          <div className="d-flex justify-content-center align-items-center mb-4">
            <img 
              src={blog.author.avatar || 'https://via.placeholder.com/40x40?text=U'}
              alt={blog.author.username}
              className="user-avatar me-2"
            />
            <span className="me-3">{blog.author.username}</span>
            <span className="me-3">•</span>
            <span className="text-muted">{formatDate(blog.created_at)}</span>
            {blog.category && (
              <>
                <span className="mx-3">•</span>
                <span className="badge bg-secondary">{blog.category}</span>
              </>
            )}
          </div>
          
          {/* Author Actions */}
          {isAuthor && (
            <div className="mb-4">
              <Link to={`/edit-blog/${blog.id}`} className="btn btn-outline-primary btn-sm me-2">
                Edit
              </Link>
              <button 
                onClick={handleDeleteBlog} 
                className="btn btn-outline-danger btn-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        
        {/* Featured Image */}
        {blog.image && (
          <div className="text-center mb-5">
            <img 
              src={blog.image} 
              className="img-fluid rounded" 
              alt={blog.title}
              style={{ maxHeight: '500px' }}
            />
          </div>
        )}
        
        {/* Blog Content */}
        <div className="blog-content mb-5">
          <p>{blog.content}</p>
        </div>
        
        {/* Comments Section */}
        <div className="comment-section">
          <h3 className="mb-4">{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h3>
          
          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-4">
              <div className="mb-3">
                <label htmlFor="comment" className="form-label">Add a comment</label>
                <textarea
                  id="comment"
                  className="form-control"
                  rows="3"
                  value={newComment}
                  onChange={handleCommentChange}
                  placeholder="Write your comment here..."
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="alert alert-info mb-4">
              <Link to="/login" className="alert-link">Login</Link> to leave a comment.
            </div>
          )}
          
          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex mb-3">
                      <img 
                        src={comment.author.avatar || 'https://via.placeholder.com/40x40?text=U'} 
                        alt={comment.author.username}
                        className="user-avatar me-2"
                      />
                      <div>
                        <h6 className="mb-0">{comment.author.username}</h6>
                        <small className="text-muted">{formatDate(comment.created_at)}</small>
                      </div>
                    </div>
                    <p className="card-text">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail; 