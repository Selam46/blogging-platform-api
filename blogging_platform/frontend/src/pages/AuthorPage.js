import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { posts } from '../services/api';
import PostCard from '../components/PostCard';

const AuthorPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [authorPosts, setAuthorPosts] = useState([]);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const fetchAuthorAndPosts = async () => {
      try {
        setLoading(true);
        
        const postsResponse = await posts.getByAuthor(id);
        setAuthorPosts(postsResponse.data.results);
        setTotalPosts(postsResponse.data.count);

        if (postsResponse.data.results.length > 0) {
          setAuthor(postsResponse.data.results[0].author_detail);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching author data:', err);
        setError('Failed to load author posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchAuthorAndPosts();
  }, [id, currentPage]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo(0, 0);
  };

  const pageSize = 10; // Assuming 10 items per page
  const totalPages = Math.ceil(totalPosts / pageSize);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!author && !loading) return <div className="alert alert-warning">Author not found or has no posts</div>;

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          {author && (
            <div className="card mb-4">
              <div className="card-body">
                <h1 className="card-title">
                  {author.first_name && author.last_name 
                    ? `${author.first_name} ${author.last_name}` 
                    : author.username
                  }
                </h1>
                <div className="text-muted mb-3">@{author.username}</div>
                <div className="badge bg-secondary">{totalPosts} posts</div>
              </div>
            </div>
          )}
          
          <h2 className="mb-4">
            Posts by {author 
              ? (author.first_name && author.last_name 
                ? `${author.first_name} ${author.last_name}` 
                : author.username) 
              : 'this author'
            }
          </h2>
          
          {authorPosts.length === 0 ? (
            <div className="alert alert-info">No posts found from this author.</div>
          ) : (
            <div className="row">
              {authorPosts.map(post => (
                <div key={post.id} className="col-md-6">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
          
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
        </div>
      </div>
    </div>
  );
};

export default AuthorPage; 