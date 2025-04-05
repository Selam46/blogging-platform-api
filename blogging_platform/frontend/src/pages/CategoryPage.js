import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { posts, categories } from '../services/api';
import PostCard from '../components/PostCard';

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [categoryPosts, setCategoryPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const fetchCategoryAndPosts = async () => {
      try {
        setLoading(true);
        const categoryResponse = await categories.getById(slug);
        setCategory(categoryResponse.data);
        const postsResponse = await posts.getAll({ 
          category: categoryResponse.data.id,
          page: currentPage
        });
        
        setCategoryPosts(postsResponse.data.results);
        setTotalPosts(postsResponse.data.count);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category. Please try again later.');
        setLoading(false);
      }
    };

    fetchCategoryAndPosts();
  }, [slug, currentPage]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo(0, 0);
  };
  const pageSize = 10; // Assuming 10 items per page
  const totalPages = Math.ceil(totalPosts / pageSize);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!category) return <div className="alert alert-warning">Category not found</div>;

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/categories">Categories</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{category.name}</li>
            </ol>
          </nav>
          
          <div className="card mb-4">
            <div className="card-body">
              <h1 className="card-title">{category.name}</h1>
              {category.description && (
                <p className="card-text">{category.description}</p>
              )}
              <div className="badge bg-secondary">{totalPosts} posts</div>
            </div>
          </div>
          
          <h2 className="mb-4">Posts in {category.name}</h2>
          
          {categoryPosts.length === 0 ? (
            <div className="alert alert-info">No posts found in this category.</div>
          ) : (
            <div className="row">
              {categoryPosts.map(post => (
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

export default CategoryPage; 