import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { posts, categories, tags } from '../services/api';
import PostCard from '../components/PostCard';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  
  // Extract search parameters
  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const selectedCategory = searchParams.get('category') || '';
  const selectedTag = searchParams.get('tag') || '';
  const selectedAuthor = searchParams.get('author') || '';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';
  
  // Local state for form inputs
  const [searchQuery, setSearchQuery] = useState(query);
  const [filterCategory, setFilterCategory] = useState(selectedCategory);
  const [filterTag, setFilterTag] = useState(selectedTag);
  const [filterDateFrom, setFilterDateFrom] = useState(dateFrom);
  const [filterDateTo, setFilterDateTo] = useState(dateTo);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Search started with params:', { query, currentPage, selectedCategory, selectedTag });
        
        // Fetch posts first, so even if categories/tags fail, we still see results
        // Prepare search parameters
        const params = {
          page: currentPage
        };
        
        if (query) params.search = query;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedTag) params.tags = selectedTag;
        if (selectedAuthor) params.author = selectedAuthor;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        
        const searchResponse = await posts.getAllPaginated(params);
        console.log('Search response:', searchResponse);
        
        if (searchResponse.success) {
          setAllPosts(searchResponse.data);
          setTotalResults(searchResponse.count);
          console.log(`Found ${searchResponse.count} posts`);
        } else {
          setAllPosts([]);
          setTotalResults(0);
          console.error('Error in search response:', searchResponse.error);
        }

        try {
          const [categoriesResponse, tagsResponse] = await Promise.all([
            categories.getAllPaginated(),
            tags.getAllPaginated()
          ]);

          if (categoriesResponse.success) {
            setAllCategories(categoriesResponse.data);
          } else {
            console.error('Error fetching categories:', categoriesResponse.error);
            setAllCategories([]);
          }

          if (tagsResponse.success) {
            setAllTags(tagsResponse.data);
          } else {
            console.error('Error fetching tags:', tagsResponse.error);
            setAllTags([]);
          }
          
        } catch (filterErr) {
          console.error('Error loading filter options:', filterErr);
          setAllCategories([]);
          setAllTags([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error searching posts:', err);
        let errorMessage = 'Failed to load search results.';
        
        if (err.response) {
          errorMessage += ` Server responded with status ${err.response.status}.`;
          console.error('Response data:', err.response.data);
        } else if (err.request) {
          errorMessage += ' No response received from server. Please check if the backend is running.';
        } else {
          errorMessage += ` Error: ${err.message}`;
        }
        
        setError(errorMessage);
        setLoading(false);
        setAllPosts([]);
        setAllCategories([]);
        setAllTags([]);
      }
    };

    fetchData();
  }, [searchParams, query, currentPage, selectedCategory, selectedTag, selectedAuthor, dateFrom, dateTo]);

  const handleSearch = (e) => {
    e.preventDefault();

    const newParams = {};
    if (searchQuery) newParams.q = searchQuery;
    if (filterCategory) newParams.category = filterCategory;
    if (filterTag) newParams.tag = filterTag;
    if (filterDateFrom) newParams.date_from = filterDateFrom;
    if (filterDateTo) newParams.date_to = filterDateTo;

    newParams.page = '1';
    
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {

    const newParams = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'page') {
        newParams[key] = value;
      }
    }
    newParams.page = newPage.toString();
    
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
    setFilterTag('');
    setFilterDateFrom('');
    setFilterDateTo('');

    const newParams = {};
    if (query) newParams.q = query;
    setSearchParams(newParams);
  };

  const pageSize = 10; // Assuming 10 items per page
  const totalPages = Math.ceil(totalResults / pageSize);

  return (
    <div className="container">
      <h1 className="mb-4">
        {query ? (
          <>Search Results for "{query}"</>
        ) : (
          <>All Blog Posts</>
        )}
      </h1>
      
      {/* Search and Filter Form */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="searchQuery" className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  id="searchQuery"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="col-md-3">
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  className="form-select"
                  id="category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {Array.isArray(allCategories) && allCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3">
                <label htmlFor="tag" className="form-label">Tag</label>
                <select
                  className="form-select"
                  id="tag"
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                >
                  <option value="">All Tags</option>
                  {Array.isArray(allTags) && allTags.map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="dateFrom" className="form-label">Date From</label>
                <input
                  type="date"
                  className="form-control"
                  id="dateFrom"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>
              
              <div className="col-md-6">
                <label htmlFor="dateTo" className="form-label">Date To</label>
                <input
                  type="date"
                  className="form-control"
                  id="dateTo"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
              
              <div className="col-12">
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Search Results */}
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <h5>Error:</h5>
          <p>{error}</p>
          <p>Please check:</p>
          <ul>
            <li>Your Django server is running on port 8000</li>
            <li>CORS is properly configured on the backend</li>
            <li>The API endpoint is correctly set up at /api/posts/</li>
          </ul>
        </div>
      ) : (
        <>
          <p className="text-muted">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} found
          </p>
          
          {allPosts.length === 0 ? (
            <div className="alert alert-info">No posts found matching your criteria.</div>
          ) : (
            <div className="row">
              {allPosts.map(post => (
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
        </>
      )}
    </div>
  );
};

export default SearchPage; 