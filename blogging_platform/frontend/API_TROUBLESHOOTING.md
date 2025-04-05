# API Troubleshooting Guide

This guide will help you resolve common issues with the blog API integration.

## Quick Diagnostic

The application includes built-in API diagnostic tools. Open your browser console (F12 or Ctrl+Shift+I) and run:

```javascript
// Test all API endpoints
window.apiTest.runApiDiagnostic()

// Test specific endpoint
window.apiTest.testApiConnection("http://localhost:8000/api/categories/")

// Test pagination
window.apiTest.testPagination("http://localhost:8000/api/posts/")
```

## Common Issues

### 1. Categories/Tags Not Showing Up

**Symptoms:**
- "No categories found" message
- Empty dropdowns in search filters

**Possible Causes & Solutions:**

a) **Django server not running**
   - Start Django: `python manage.py runserver`
   
b) **CORS issues**
   - Ensure your Django settings include proper CORS configuration:
   ```python
   CORS_ALLOW_ALL_ORIGINS = True  # In development only!
   ```
   
c) **API returning unexpected format**
   - Check the Django REST Framework pagination settings in `settings.py`:
   ```python
   REST_FRAMEWORK = {
       'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
       'PAGE_SIZE': 10,
   }
   ```
   - Our frontend now handles both paginated and non-paginated responses

d) **Database empty**
   - Add categories via the Django admin interface: http://localhost:8000/admin/

### 2. API Connection Errors

**Symptoms:**
- Network errors in console
- "Failed to load..." error messages

**Possible Causes & Solutions:**

a) **Wrong port/URL**
   - Ensure Django is running on port 8000
   - Check the API_URL in `src/services/api.js` matches your Django server

b) **Network/Firewall issues**
   - Try disabling firewall/antivirus temporarily
   - Check browser console for specific CORS errors

c) **Django REST Framework not configured properly**
   - Verify URLs are registered in your Django project's `urls.py`

### 3. Search Not Working

**Symptoms:**
- No results when searching
- Filtering not working

**Possible Causes & Solutions:**

a) **Search parameters misconfigured**
   - Check the console logs for the actual API calls being made
   - Verify the search parameters in the backend match the frontend

b) **Backend search implementation**
   - Make sure the Django view or viewset implements searching:
   ```python
   from rest_framework import filters
   
   class PostViewSet(viewsets.ModelViewSet):
       search_fields = ['title', 'content', 'author__username']
       filter_backends = [filters.SearchFilter, filters.OrderingFilter]
   ```

### 4. Pagination Issues

**Symptoms:**
- Only seeing first page of results
- Page navigation not working

**Possible Causes & Solutions:**

a) **Frontend not handling pagination correctly**
   - The app should now handle pagination properly
   - Check the network tab to see if pagination parameters are being sent

b) **Backend pagination misconfigured**
   - Check Django REST Framework pagination settings:
   ```python
   REST_FRAMEWORK = {
       'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
       'PAGE_SIZE': 10,
   }
   ```

## Advanced Debugging

For more advanced issues, try:

1. Inspecting the Network tab in browser DevTools to see:
   - Request URLs
   - HTTP status codes
   - Response data

2. Adding temporary debugging logs:
   ```javascript
   console.log("API Response:", response);
   ```

3. Use Postman or curl to test API endpoints directly:
   ```bash
   curl http://localhost:8000/api/categories/
   ```

## Still Having Issues?

If you continue to experience problems:

1. Check Django logs for server-side errors
2. Run `python manage.py check` for Django configuration issues
3. Make sure all migrations are applied: `python manage.py migrate`
4. Restart both Django and React development servers 