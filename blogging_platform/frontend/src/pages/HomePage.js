import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { posts } from '../services/api';
import PostCard from '../components/PostCard';

const HomePage = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log(`Fetching posts for page ${currentPage}`);

        const response = await posts.getAllPaginated({ page: currentPage });
        console.log('Posts response:', response);
        
        if (response.success) {
          setAllPosts(response.data || []);

          const count = response.count;
          const pageSize = 10; // Assuming 10 items per page
          setTotalPages(Math.ceil(count / pageSize));
          
          console.log(`Found ${response.data.length} posts. Total: ${count}, Pages: ${Math.ceil(count / pageSize)}`);
        } else {
          console.error('Error in posts response:', response.error);
          setError('Failed to load posts. Please try again later.');
          setAllPosts([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
        setAllPosts([]);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams({ page: newPage.toString() });
    window.scrollTo(0, 0);
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container">
      <h1 className="mb-4">Latest Blog Posts</h1>
      
      {Array.isArray(allPosts) && allPosts.length === 0 ? (
        <div className="alert alert-info">No posts found. Create some posts to see them here.</div>
      ) : (
        <div className="row">
          {Array.isArray(allPosts) && allPosts.map(post => (
            <div key={post.id} className="col-md-6 col-lg-4">
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
  );
};

export default HomePage; 