import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { posts } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyPostsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-posts' } });
      return;
    }

    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const response = await posts.getAll({ 
          author: currentUser.id,
          page: currentPage
        });
        
        setUserPosts(response.data.results);
        setTotalPosts(response.data.count);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError('Failed to load your posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [isAuthenticated, currentUser, navigate, currentPage]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo(0, 0);
  };

  const handleDeletePost = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await posts.delete(slug);
      const response = await posts.getAll({ author: currentUser.id });
      setUserPosts(response.data.results);
      setTotalPosts(response.data.count);
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again later.');
    }
  };

  const pageSize = 10; // Assuming 10 items per page
  const totalPages = Math.ceil(totalPosts / pageSize);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Posts</h1>
        <Link to="/posts/new" className="btn btn-primary">
          <i className="fas fa-plus me-1"></i> Create New Post
        </Link>
      </div>
      
      {userPosts.length === 0 ? (
        <div className="alert alert-info">
          You haven't created any posts yet. <Link to="/posts/new">Create your first post</Link>!
        </div>
      ) : (
        <>
          <div className="mb-3">
            <p className="text-muted">You have {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}</p>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userPosts.map(post => (
                  <tr key={post.id}>
                    <td>
                      <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                    </td>
                    <td>
                      <span className={`badge ${post.status === 'published' ? 'bg-success' : 'bg-secondary'}`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{new Date(post.published_date).toLocaleDateString()}</td>
                    <td>{post.views}</td>
                    <td>{post.like_count}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Link 
                          to={`/posts/${post.slug}/edit`} 
                          className="btn btn-outline-primary"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDeletePost(post.slug)} 
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(totalPages).keys()].map(num => (
                  <li key={num + 1} className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(num + 1)}
                    >
                      {num + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default MyPostsPage;