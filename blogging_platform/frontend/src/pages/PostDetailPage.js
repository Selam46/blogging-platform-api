import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { posts, comments } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        setLoading(true);
        // Fetch post details
        const postResponse = await posts.getById(slug);
        setPost(postResponse.data);

        const commentsResponse = await comments.getByPostPaginated(postResponse.data.id);
        console.log('Comments response:', commentsResponse);
        
        if (commentsResponse.success) {
          setPostComments(commentsResponse.data || []);
        } else {
          console.error('Error fetching comments:', commentsResponse.error);
          setPostComments([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post details:', err);
        setError('Failed to load post. Please try again later.');
        setPostComments([]);
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [slug]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/posts/${slug}` } });
      return;
    }

    try {
      await posts.like(slug);
      const postResponse = await posts.getById(slug);
      setPost(postResponse.data);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await posts.delete(slug);
      navigate('/');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again later.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/posts/${slug}` } });
      return;
    }

    if (!newComment.trim()) return;

    try {
      await comments.create({ 
        post: post.id, 
        content: newComment 
      });

      const commentsResponse = await comments.getByPostPaginated(post.id);
      if (commentsResponse.success) {
        setPostComments(commentsResponse.data || []);
      }
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await comments.reply(replyTo.id, { content: replyContent });
      const commentsResponse = await comments.getByPostPaginated(post.id);
      if (commentsResponse.success) {
        setPostComments(commentsResponse.data || []);
      }
      setReplyTo(null);
      setReplyContent('');
    } catch (err) {
      console.error('Error replying to comment:', err);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!post) return <div className="alert alert-warning">Post not found</div>;

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          {/* Post Header */}
          <h1 className="mb-3">{post.title}</h1>
          
          <div className="mb-4 text-muted">
            <span className="me-3">
              <i className="fas fa-user me-1"></i> {post.author}
            </span>
            <span className="me-3">
              <i className="fas fa-calendar me-1"></i> {new Date(post.published_date).toLocaleDateString()}
            </span>
            <span className="me-3">
              <i className="fas fa-folder me-1"></i> 
              <Link to={`/categories/${post.category_detail?.slug}`}>
                {post.category_detail?.name || 'Uncategorized'}
              </Link>
            </span>
            <span className="me-3">
              <i className="fas fa-clock me-1"></i> {post.read_time} min read
            </span>
            <span>
              <i className="fas fa-eye me-1"></i> {post.views} views
            </span>
          </div>
          
          {/* Featured Image */}
          {post.featured_image && (
            <img 
              src={post.featured_image} 
              className="img-fluid rounded mb-4" 
              alt={post.title} 
            />
          )}
          
          {/* Post Content */}
          <div className="post-content mb-4">
            <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
          </div>
          
          {/* Tags */}
          <div className="mb-4">
            {post.tags_detail && post.tags_detail.map(tag => (
              <Link 
                key={tag.id} 
                to={`/tags/${tag.slug}`} 
                className="badge bg-secondary text-decoration-none link-light me-1"
              >
                {tag.name}
              </Link>
            ))}
          </div>
          
          {/* Like Button & Post Actions */}
          <div className="d-flex justify-content-between mb-5">
            <button 
              className="btn btn-outline-danger" 
              onClick={handleLike}
            >
              <i className={`${post.likes?.includes(currentUser?.id) ? 'fas' : 'far'} fa-heart me-1`}></i>
              Like ({post.like_count})
            </button>
            
            {isAuthenticated && currentUser?.id === post.author_detail?.id && (
              <div>
                <Link to={`/posts/${slug}/edit`} className="btn btn-outline-primary me-2">
                  Edit
                </Link>
                <button onClick={handleDelete} className="btn btn-outline-danger">
                  Delete
                </button>
              </div>
            )}
          </div>
          
          {/* Comments Section */}
          <h3 className="mb-4">Comments ({postComments.length})</h3>
          
          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="mb-4">
              <div className="mb-3">
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Write a comment..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Post Comment
              </button>
            </form>
          ) : (
            <div className="alert alert-info mb-4">
              <Link to="/login">Login</Link> to post a comment.
            </div>
          )}
          
          {/* Comments List */}
          {Array.isArray(postComments) && postComments.length === 0 ? (
            <div className="alert alert-light">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="comments-list">
              {Array.isArray(postComments) && postComments.map(comment => (
                <div key={comment.id} className="card mb-3">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-2 text-muted">
                      {comment.author_detail?.username} • {new Date(comment.created_date).toLocaleDateString()}
                    </h6>
                    <p className="card-text">{comment.content}</p>
                    
                    {isAuthenticated && (
                      <button 
                        className="btn btn-sm btn-link text-decoration-none p-0" 
                        onClick={() => setReplyTo(comment)}
                      >
                        Reply
                      </button>
                    )}
                    
                    {/* Replies */}
                    {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
                      <div className="mt-3 ms-4 border-start ps-3">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="mb-3">
                            <h6 className="text-muted mb-1">
                              {reply.author_detail?.username} • {new Date(reply.created_date).toLocaleDateString()}
                            </h6>
                            <p className="mb-1">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Reply Form (shown when replying) */}
              {replyTo && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="card-title">
                      Replying to {replyTo.author_detail?.username}
                    </h6>
                    <form onSubmit={handleReply}>
                      <div className="mb-3">
                        <textarea 
                          className="form-control" 
                          rows="2" 
                          placeholder="Write your reply..." 
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          required
                        ></textarea>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button 
                          type="button" 
                          className="btn btn-link text-decoration-none" 
                          onClick={() => setReplyTo(null)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary ms-2">
                          Reply
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage; 