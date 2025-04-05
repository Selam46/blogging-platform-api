import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  if (!post || typeof post !== 'object') {
    console.error('Invalid post data:', post);
    return (
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Error: Invalid post data</h5>
          <p className="card-text text-danger">The post data is missing or invalid.</p>
        </div>
      </div>
    );
  }
  
  const truncateContent = (content, maxLength = 150) => {
    if (!content || typeof content !== 'string') return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };


  const tags = Array.isArray(post.tags_detail) ? post.tags_detail : [];
  const publishedDate = post.published_date ? new Date(post.published_date) : new Date();
  
  return (
    <div className="card mb-4 shadow-sm">
      {post.featured_image && (
        <img 
          src={post.featured_image} 
          className="card-img-top" 
          alt={post.title || 'Blog post'} 
          style={{ height: '180px', objectFit: 'cover' }} 
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = '/placeholder-image.jpg';
            e.target.alt = 'Image not available';
          }}
        />
      )}
      <div className="card-body">
        <h5 className="card-title">{post.title || 'Untitled Post'}</h5>
        
        <div className="mb-2 text-muted small">
          <span className="me-2">
            <i className="fas fa-user me-1"></i> {post.author || 'Unknown Author'}
          </span>
          <span className="me-2">
            <i className="fas fa-calendar me-1"></i> {publishedDate.toLocaleDateString()}
          </span>
          <span className="me-2">
            <i className="fas fa-folder me-1"></i> {post.category_detail?.name || 'Uncategorized'}
          </span>
          <span>
            <i className="fas fa-clock me-1"></i> {post.read_time || '?'} min read
          </span>
        </div>
        
        <p className="card-text">
          {post.excerpt ? truncateContent(post.excerpt) : truncateContent(post.content || '')}
        </p>
        
        <div className="mb-2">
          {tags.map(tag => (
            <Link 
              key={tag.id} 
              to={`/tags/${tag.slug}`}
              className="badge bg-secondary text-decoration-none link-light me-1"
            >
              {tag.name}
            </Link>
          ))}
        </div>
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <span className="me-3">
              <i className="far fa-eye me-1"></i> {post.views || 0}
            </span>
            <span>
              <i className="far fa-heart me-1"></i> {post.like_count || 0}
            </span>
          </div>
          <Link to={`/posts/${post.slug}`} className="btn btn-primary">
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard; 