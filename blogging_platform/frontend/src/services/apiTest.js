import axios from 'axios';

const testApiConnection = async (endpoint = 'http://localhost:8000/api/', options = {}) => {
  try {
    console.log(`Testing API connection to ${endpoint}...`);
    const startTime = performance.now();
    
    const response = await axios.get(endpoint, {
      timeout: options.timeout || 5000,
      headers: options.headers || {}
    });
    
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    console.log(`✅ API connection successful to ${endpoint}`);
    console.log(`Response time: ${responseTime}ms`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    // Check if response is paginated
    let responseData = response.data;
    const isPaginated = responseData && 
      typeof responseData === 'object' && 
      'results' in responseData &&
      'count' in responseData;
    
    if (isPaginated) {
      console.log(`Paginated response detected:`);
      console.log(`- Total items: ${responseData.count}`);
      console.log(`- Items in this page: ${responseData.results.length}`);
      console.log(`- Next page: ${responseData.next || 'None'}`);
      console.log(`- Previous page: ${responseData.previous || 'None'}`);
    }
    
    return {
      success: true,
      endpoint,
      status: response.status,
      statusText: response.statusText,
      responseTime,
      dataType: typeof response.data,
      isPaginated,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    console.error(`❌ API connection failed to ${endpoint}`);
    
    let errorData = {
      message: error.message
    };
    
    if (error.response) {
      console.error(`Status: ${error.response.status} ${error.response.statusText}`);
      console.error('Response data:', error.response.data);
      errorData.status = error.response.status;
      errorData.statusText = error.response.statusText;
      errorData.data = error.response.data;
    } else if (error.request) {
      console.error('No response received from server');
      errorData.noResponse = true;
    }
    
    return {
      success: false,
      endpoint,
      error: errorData
    };
  }
};


const runApiDiagnostic = async () => {
  console.group('🔍 API Diagnostic Tool');
  console.log('Starting comprehensive API endpoint tests...');
  
  const baseUrl = 'http://localhost:8000/api';
  const results = {};
  
  try {
    // Test base API endpoint
    results.base = await testApiConnection(`${baseUrl}/`);
    
    // Test categories endpoint
    results.categories = await testApiConnection(`${baseUrl}/categories/`);
    
    // Test posts endpoint with pagination
    results.posts = await testApiConnection(`${baseUrl}/posts/`);
    
    // Test tags endpoint
    results.tags = await testApiConnection(`${baseUrl}/tags/`);
    
    const overallSuccess = Object.values(results).every(r => r.success);
    
    if (overallSuccess) {
      console.log('✅ All API endpoints are functioning correctly!');
    } else {
      console.error('❌ Some API endpoints failed the test');
      
      // List failed endpoints
      const failedEndpoints = Object.entries(results)
        .filter(([_, result]) => !result.success)
        .map(([name, _]) => name);
      
      console.error('Failed endpoints:', failedEndpoints.join(', '));
    }
    
    return {
      success: overallSuccess,
      results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error during API diagnostic:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    console.groupEnd();
  }
};

/**
 * Tests pagination by fetching multiple pages of data
 * @param {string} endpoint - The API endpoint to test pagination
 * @param {number} pages - Number of pages to test
 * @returns {Promise<Object>} - Results of pagination test
 */
const testPagination = async (endpoint = 'http://localhost:8000/api/posts/', pages = 2) => {
  console.group(`🔢 Testing Pagination for ${endpoint}`);
  
  try {
    const results = [];
    let nextPage = endpoint;
    let hasMore = true;
    let pageCount = 0;
    
    while (hasMore && pageCount < pages) {
      console.log(`Fetching page ${pageCount + 1}: ${nextPage}`);
      const response = await axios.get(nextPage);
      
      if (response.data && 'results' in response.data) {
        results.push({
          page: pageCount + 1,
          count: response.data.count,
          itemCount: response.data.results.length,
          next: response.data.next,
          previous: response.data.previous
        });
        
        // Check if there's a next page
        if (response.data.next) {
          nextPage = response.data.next;
          pageCount++;
        } else {
          hasMore = false;
        }
      } else {
        console.warn('Response is not paginated');
        hasMore = false;
      }
    }
    
    console.log(`✅ Pagination test complete. Fetched ${results.length} pages.`);
    
    return {
      success: true,
      paginationDetected: results.length > 0,
      pages: results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Pagination test failed:', error);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    console.groupEnd();
  }
};


 
const testPostCreation = async () => {
  console.group('🧪 Testing Post Creation');
  
  try {
    const testData = {
      title: 'Test Post ' + new Date().toISOString(),
      content: 'This is a test post created by the API diagnostic tool.',
      excerpt: 'Test post excerpt',
      category: 1, 
      tag_names: 'test, api',
      status: 'draft'
    };
    
    console.log('Sending test post data:', testData);
    
    const response = await axios.post('http://localhost:8000/api/posts/', testData, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') ? 
          { 'Authorization': `Token ${localStorage.getItem('token')}` } : 
          {})
      }
    });
    
    console.log('✅ Post creation test successful!');
    console.log('Response status:', response.status);
    console.log('Created post:', response.data);
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('❌ Post creation test failed');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
 
      if (error.response.data) {
        console.group('Validation Errors:');
        Object.entries(error.response.data).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            console.error(`${field}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            console.error(`${field}: ${messages}`);
          } else {
            console.error(`${field}:`, messages);
          }
        });
        console.groupEnd();
      }
      
      return {
        success: false,
        error: {
          message: 'Post creation failed',
          status: error.response.status,
          data: error.response.data
        }
      };
    } else if (error.request) {
      console.error('No response received from server');
      return {
        success: false,
        error: {
          message: 'No response received from server',
          request: error.request
        }
      };
    } else {
      console.error('Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message
        }
      };
    }
  } finally {
    console.groupEnd();
  }
};

const apiTestUtils = {
  testApiConnection,
  runApiDiagnostic,
  testPagination,
  testPostCreation
};

export default apiTestUtils; 