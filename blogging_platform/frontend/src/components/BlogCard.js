import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  const imageUrl = blog.image || 'https://via.placeholder.com/800x400?text=Blog+Image';
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };
  
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card blog-card h-100">
        {blog.featured && (
          <span className="featured-badge">Featured</span>
        )}
        
        <img 
          src={imageUrl} 
          className="card-img-top blog-image" 
          alt={blog.title} 
        />
        
        <div className="card-body">
          <div className="d-flex justify-content-between mb-2">
            <small className="text-muted">{formatDate(blog.created_at)}</small>
            <small className="text-muted">{blog.category}</small>
          </div>
          
          <h5 className="card-title">
            <Link to={`/blog/${blog.id}`} className="text-decoration-none text-dark">
              {blog.title}
            </Link>
          </h5>
          
          <p className="card-text">
            {truncateContent(blog.content)}
          </p>
        </div>
        
        <div className="card-footer bg-transparent border-top-0">
          <div className="d-flex align-items-center">
            <img 
              src={blog.author.avatar || 'https://via.placeholder.com/40x40?text=U'} 
              alt={blog.author.username}
              className="user-avatar me-2"
            />
            <span className="small">{blog.author.username}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard; 