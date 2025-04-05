import axios from 'axios';
const DEBUG = true;

const API_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (token.includes('dummy_toke')) {
        console.warn('Detected invalid token - not adding to request');
        localStorage.removeItem('token');
        return config;
      }

      config.headers['Authorization'] = `Token ${token}`;

      if (process.env.NODE_ENV === 'development') {
        console.log(`Adding auth token to request: ${config.method.toUpperCase()} ${config.url}`);
        console.log(`Token length: ${token.length}, preview: ${token.substring(0, 10)}...`);
      }
    } else {
      console.warn(`Request without token: ${config.method.toUpperCase()} ${config.url}`);
    }

    if (process.env.NODE_ENV === 'development' || DEBUG) {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
      if (config.params) {
        console.log('Request params:', config.params);
      }
      if (config.data) {
        console.log('Request data:', config.data);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development' || DEBUG) {
      console.log(`API Response (${response.status}): ${response.config.method.toUpperCase()} ${response.config.url}`);
      console.log('Response data:', response.data);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      if (process.env.NODE_ENV === 'development' || DEBUG) {
        console.error(`API Error (${error.response.status}): ${error.config.method.toUpperCase()} ${error.config.url}`);
        console.error('Error data:', error.response.data);
        
        if (error.response.status === 401) {
          console.error('Authentication error detected. Current token:', localStorage.getItem('token'));
        }
      }

      if (error.response.status === 401) {
        const errorMsg = typeof error.response.data === 'object' ? 
          error.response.data.detail || JSON.stringify(error.response.data) : 
          error.response.data;

        if (errorMsg.includes('Invalid token') || 
            errorMsg.includes('expired') || 
            errorMsg.includes('authentication credentials')) {
          console.error('Token appears to be invalid or expired');
        }
      }
    } else if (error.request) {
      console.error('Network error - no response received:', error.request);
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

const safelyHandleResponse = async (apiCall) => {
  try {
    const response = await apiCall();
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: {
        message: error.message,
        status: error.response?.status,
        details: error.response?.data
      }
    };
  }
};

const handlePaginatedResponse = (response) => {
  if (response.data && 'results' in response.data) {
    return {
      success: true,
      data: response.data.results,
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      isPaginated: true
    };
  }

  return {
    success: true,
    data: response.data,
    count: Array.isArray(response.data) ? response.data.length : 0,
    isPaginated: false
  };
};

export const auth = {
  register: (userData) => {
    const transformedData = {
      username: userData.username,
      password1: userData.password,
      password2: userData.password 
    };
    
    console.log('Making registration request with data:', {
      ...transformedData, 
      password1: '[FILTERED]',
      password2: '[FILTERED]'
    });
    
    return axios.post('http://localhost:8000/accounts/register/', transformedData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },
  login: (userData) => {
    console.log('Making login request with data:', {...userData, password: '[FILTERED]'});
    return axios.post('http://localhost:8000/accounts/login/', userData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },
  logout: () => axios.get('http://localhost:8000/accounts/logout/'),
  refreshToken: () => {
    const token = localStorage.getItem('token');
    console.log('Refreshing token, current token preview:', token ? `${token.substring(0, 10)}...` : 'none');
    
    return axios.post('http://localhost:8000/accounts/token/refresh/', {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    });
  }
};

export const posts = {
  getAll: (params) => apiClient.get('/posts/', { params }),
  getAllSafe: (params) => safelyHandleResponse(() => apiClient.get('/posts/', { params })),
  getAllPaginated: async (params) => {
    try {
      console.log('Fetching posts with params:', params);
      const response = await apiClient.get('/posts/', { params });
      console.log('Posts response status:', response.status);
      return handlePaginatedResponse(response);
    } catch (error) {
      console.error('Error fetching posts:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      return {
        success: false,
        data: [],
        count: 0,
        error: {
          message: error.message || 'Failed to load posts',
          status: error.response?.status,
          details: error.response?.data
        }
      };
    }
  },
  getById: (slug) => apiClient.get(`/posts/${slug}/`),
  create: (postData) => apiClient.post('/posts/', postData),
  createSafe: async (postData) => {
    try {
      console.log('Creating post with data:', {
        ...postData,
        content: postData.content ? `${postData.content.substring(0, 50)}...` : '[empty]'
      });

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found when creating post');
        return {
          success: false,
          error: {
            message: 'Authentication required. Please log in again.',
            status: 401
          }
        };
      }

      const formattedToken = token.startsWith('Token ') ? token : `Token ${token}`;
      console.log(`Using token with format: ${formattedToken.substring(0, 15)}...`);

      const minimalPostData = {
        title: postData.title?.trim() || 'Untitled Post',
        content: postData.content || ''
      };

      if (postData.excerpt && postData.excerpt.trim()) {
        minimalPostData.excerpt = postData.excerpt.trim();
      }

      if (postData.featured_image && postData.featured_image.trim()) {
        minimalPostData.featured_image = postData.featured_image.trim();
      }

      if (postData.status) {
        minimalPostData.status = postData.status;
      }

      if (postData.category) {
        let categoryId = postData.category;
        if (typeof postData.category === 'string') {
          categoryId = parseInt(postData.category, 10);
        }
        if (!isNaN(categoryId)) {
          minimalPostData.category = categoryId;
        }
      }

      if (postData.tag_names) {
        if (typeof postData.tag_names === 'string') {
          minimalPostData.tag_names = postData.tag_names.trim();
        } else if (Array.isArray(postData.tag_names)) {
          minimalPostData.tag_names = postData.tag_names.join(',');
        }
      }
      
      console.log('Making API request with minimal data:', minimalPostData);

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': formattedToken
      };

      const directUrl = 'http://localhost:8000/api/posts/';
      console.log(`Using direct URL: ${directUrl}`);

      try {
        const response = await axios({
          method: 'post',
          url: directUrl,
          headers: headers,
          data: minimalPostData,
          timeout: 30000
        });
        
        console.log('Post created successfully:', response.data);
        return {
          success: true,
          data: response.data
        };
      } catch (apiError) {
        console.error('Error from API request:', apiError);
        
        if (apiError.response) {
          console.error('Server response error:', apiError.response.data);

          const errorData = apiError.response.data;
          if (errorData.error) {
            throw new Error(errorData.error);
          }
        }

        throw apiError;
      }
    } catch (error) {

      console.error('Error creating post:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Server returned error response:');
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        console.error('Data:', error.response.data);
      } else if (error.request) {
        console.error('No response received from server:', error.request);
      }

      let errorMessage = 'Failed to create post.';
      let status = 500;
      let details = null;
      
      if (error.response) {
        status = error.response.status;

        switch(status) {
          case 400:
            errorMessage = 'The server rejected the post data.';
            details = error.response.data;
            break;
          case 401:
            errorMessage = 'Authentication required. Please log in again.';
            const token = localStorage.getItem('token');
            console.error('Auth error with token:', token ? `${token.substring(0, 10)}...` : 'No token');
            break;
          case 403:
            errorMessage = 'You do not have permission to create posts.';
            break;
          case 500:
            errorMessage = 'Server error occurred while creating post.';
            if (error.response.data && error.response.data.error) {
              errorMessage += ' ' + error.response.data.error;
            }
            break;
          default:
            errorMessage = `Error creating post (${status}).`;
        }
      } else if (error.request) {
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        errorMessage = `Request error: ${error.message}`;
      }
      
      return {
        success: false,
        error: {
          message: errorMessage,
          status,
          details,
          original: error
        }
      };
    }
  },
  update: (slug, postData) => apiClient.put(`/posts/${slug}/`, postData),
  updateSafe: async (slug, postData) => {
    try {
      console.log(`Updating post ${slug} with data:`, {
        ...postData,
        content: postData.content ? `${postData.content.substring(0, 50)}...` : '[empty]'
      });

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found when updating post');
        return {
          success: false,
          error: {
            message: 'Authentication required. Please log in again.',
            status: 401
          }
        };
      }

      const formattedToken = token.startsWith('Token ') ? token : `Token ${token}`;
      console.log(`Using token with format: ${formattedToken.substring(0, 15)}...`);


      if (postData.category && typeof postData.category === 'string') {
        postData.category = parseInt(postData.category, 10);
      }
      
      console.log('Making API request to update post...');
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': formattedToken
      };
      

      const directUrl = `http://localhost:8000/api/posts/${slug}/`;
      console.log(`Using direct URL: ${directUrl}`);
  
      try {
        const response = await axios({
          method: 'put',
          url: directUrl,
          headers: headers,
          data: postData,
          timeout: 30000
        });
        
        console.log('Post updated successfully:', response.data);
        return {
          success: true,
          data: response.data
        };
      } catch (apiError) {
        console.error('Error from API request:', apiError);
        
        if (apiError.response) {
          console.error('Server response error:', apiError.response.data);

          const errorData = apiError.response.data;
          if (errorData.error) {
            throw new Error(errorData.error);
          }
        }

        throw apiError;
      }
    } catch (error) {
      console.error('Error updating post:', error);

      let errorMessage = 'Failed to update post.';
      let status = 500;
      let details = null;
      
      if (error.response) {
        status = error.response.status;

        switch(status) {
          case 400:
            errorMessage = 'The server rejected the post data.';
            details = error.response.data;
            break;
          case 401:
            errorMessage = 'Authentication required. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to update this post.';
            break;
          case 404:
            errorMessage = 'Post not found.';
            break;
          case 500:
            errorMessage = 'Server error occurred while updating post.';
            break;
          default:
            errorMessage = `Error updating post (${status}).`;
        }
      } else if (error.request) {
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        errorMessage = `Request error: ${error.message}`;
      }
      
      return {
        success: false,
        error: {
          message: errorMessage,
          status,
          details,
          original: error,
          response: error.response
        }
      };
    }
  },
  delete: (slug) => apiClient.delete(`/posts/${slug}/`),
  like: (slug) => apiClient.post(`/posts/${slug}/like/`),
  getDrafts: () => apiClient.get('/posts/drafts/'),
  getDraftsSafe: async () => {
    try {
      console.log('Fetching draft posts...');
      const response = await apiClient.get('/posts/drafts/');
      console.log('Drafts response status:', response.status);
      return handlePaginatedResponse(response);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      return {
        success: false,
        data: [],
        count: 0,
        error: {
          message: error.message || 'Failed to load draft posts',
          status: error.response?.status,
          details: error.response?.data
        }
      };
    }
  },
  getByCategory: (categorySlug) => apiClient.get('/posts/', { params: { category: categorySlug } }),
  getByAuthor: (authorId) => apiClient.get('/posts/', { params: { author: authorId } }),
  search: (query) => apiClient.get('/posts/', { params: { search: query } })
};

// Categories API
export const categories = {
  getAll: () => apiClient.get('/categories/'),
  getAllSafe: () => safelyHandleResponse(() => apiClient.get('/categories/')),
  getAllPaginated: async () => {
    try {
      console.log('Fetching categories...');
      const response = await apiClient.get('/categories/');
      console.log('Categories response:', response);
      return handlePaginatedResponse(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      return {
        success: false,
        data: [],
        count: 0,
        error: {
          message: error.message || 'Failed to load categories',
          status: error.response?.status,
          details: error.response?.data
        }
      };
    }
  },
  getById: (slug) => apiClient.get(`/categories/${slug}/`)
};

// Tags API
export const tags = {
  getAll: () => apiClient.get('/tags/'),
  getAllSafe: () => safelyHandleResponse(() => apiClient.get('/tags/')),
  getAllPaginated: async () => {
    try {
      const response = await apiClient.get('/tags/');
      return handlePaginatedResponse(response);
    } catch (error) {
      return {
        success: false,
        data: [],
        count: 0,
        error: {
          message: error.message,
          status: error.response?.status,
          details: error.response?.data
        }
      };
    }
  },
  getById: (slug) => apiClient.get(`/tags/${slug}/`)
};

// Comments API
export const comments = {
  getByPost: (postId) => apiClient.get('/comments/', { params: { post: postId } }),
  getByPostPaginated: async (postId) => {
    try {
      const response = await apiClient.get('/comments/', { params: { post: postId } });
      return handlePaginatedResponse(response);
    } catch (error) {
      return {
        success: false,
        data: [],
        count: 0,
        error: {
          message: error.message,
          status: error.response?.status,
          details: error.response?.data
        }
      };
    }
  },
  create: (commentData) => apiClient.post('/comments/', commentData),
  reply: (commentId, replyData) => apiClient.post(`/comments/${commentId}/reply/`, replyData)
};

export const testApi = async () => {
  try {
    const result = await apiClient.get('/');
    return { success: true, status: result.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status 
    };
  }
};

export default apiClient;