import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categories, posts } from '../services/api';

const CategoriesPage = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log('Fetching categories...');
        const categoriesResult = await categories.getAllPaginated();
        console.log('Categories API response:', categoriesResult);
        
        if (!categoriesResult.success) {
          throw new Error(categoriesResult.error?.message || 'Failed to fetch categories');
        }

        const categoriesData = categoriesResult.data;
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          console.log(`Found ${categoriesData.length} categories, fetching post counts...`);
          const categoriesWithPostCounts = await Promise.all(
            categoriesData.map(async (category) => {
              try {
                const postsResult = await posts.getAllPaginated({ category: category.id });
                
                return {
                  ...category,
                  postCount: postsResult.success ? postsResult.count : 0
                };
              } catch (err) {
                console.error(`Error fetching posts for category ${category.name}:`, err);
                return {
                  ...category,
                  postCount: 0
                };
              }
            })
          );
          
          setAllCategories(categoriesWithPostCounts);
          console.log('Categories with post counts:', categoriesWithPostCounts);
        } else {
          console.log('No categories found or invalid data structure');
          setAllCategories([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchCategories:', err);
        let errorMessage = 'Failed to load categories.';
        
        if (err.response) {
          errorMessage += ` Server responded with status ${err.response.status}.`;
          console.error('Response data:', err.response.data);
        } else if (err.request) {
          errorMessage += ' No response received from server. Please check if the backend is running.';
        } else {
          errorMessage += ` Error: ${err.message}`;
        }
        
        setError(errorMessage);
        setAllCategories([]);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Blog Categories</h1>
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <h5>Error:</h5>
          <p>{error}</p>
          <p>Please check:</p>
          <ul>
            <li>Your Django server is running on port 8000</li>
            <li>CORS is properly configured on the backend</li>
            <li>The API endpoint is correctly set up at /api/categories/</li>
          </ul>
        </div>
      ) : (
        <div className="row">
          {allCategories.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">
                No categories found. Create some categories in the Django admin panel.
              </div>
            </div>
          ) : (
            allCategories.map(category => (
              <div key={category.id} className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{category.name}</h5>
                    <p className="card-text">
                      {category.description || 'No description available'}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-primary">
                        {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                      </span>
                      <Link 
                        to={`/search?category=${category.id}`} 
                        className="btn btn-outline-secondary btn-sm"
                      >
                        View Posts
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage; 