# Advanced Blogging Platform API

A Django REST Framework API for a feature-rich blogging platform with authentication, permissions, and advanced features.

## Backend Features

- **User Authentication**: Register, login, and logout functionality
- **Post Management**: Create, read, update, and delete blog posts
- **Advanced Post Features**:
  - Featured images for posts
  - Post status (draft or published)
  - Automatic read time calculation
  - View count tracking
  - Likes system
  - Slugified URLs
  - Post excerpts
- **Comment System**:
  - Nested comments (replies)
  - Comment moderation
- **Categorization**: Organize posts with categories and tags
- **Advanced Filtering**: Filter by multiple criteria
- **Full-Text Search**: Search across all content
- **Sorting and Pagination**: Order results and paginate for better performance

## Frontend Integration

This API is fully integrated with a React frontend located in the `frontend/` directory. The frontend provides:

- Modern, responsive UI built with React and Bootstrap
- Complete user authentication flow with token management
- Post creation, editing, and deletion interfaces
- Draft post management
- Post listing and filtering by category, tag, or author
- Search functionality
- User profiles
- Comment system with replies

To run the frontend, see the [root README.md](../README.md) for setup instructions.

## API Endpoints

### Authentication

- `POST /accounts/register/` - Register a new user
- `POST /accounts/login/` - Login
- `GET /accounts/logout/` - Logout

### Posts

- `GET /api/posts/` - List all published posts (paginated)
- `POST /api/posts/` - Create a new post (authentication required)
- `GET /api/posts/{slug}/` - Retrieve a specific post
- `PUT /api/posts/{slug}/` - Update a post (only for author)
- `DELETE /api/posts/{slug}/` - Delete a post (only for author)
- `POST /api/posts/{slug}/like/` - Like/unlike a post
- `GET /api/posts/drafts/` - Get all drafts for the authenticated user

### Categories

- `GET /api/categories/` - List all categories
- `GET /api/categories/{slug}/` - Retrieve a specific category

### Tags

- `GET /api/tags/` - List all tags
- `GET /api/tags/{slug}/` - Retrieve a specific tag

### Comments

- `GET /api/comments/` - List top-level comments
- `GET /api/comments/?post={post_id}` - List comments for a specific post
- `POST /api/comments/` - Create a new comment
- `POST /api/comments/{id}/reply/` - Reply to a comment

## Creating Posts

When creating posts, you have two options for adding tags:

1. Using tag IDs:
   ```json
   {
     "title": "My New Post",
     "content": "Post content here",
     "category": 1,
     "tags": [1, 2, 3]
   }
   ```

2. Using tag names (automatically creates tags if they don't exist):
   ```json
   {
     "title": "My New Post",
     "content": "Post content here",
     "category": 1,
     "tag_names": "python, django, rest"
   }
   ```

## Filtering and Searching

The API supports various filtering and searching options:

### Post Filtering

- By author: `/api/posts/?author=1`
- By category: `/api/posts/?category=2`
- By status: `/api/posts/?status=published`
- By date range: `/api/posts/?date_from=2023-01-01&date_to=2023-12-31`
- By tag name (partial match): `/api/posts/?tags=python`
- By read time range: `/api/posts/?min_read_time=5&max_read_time=10`

### Full-text Search

- Search across title, content, excerpt, author, category, and tags:
  `/api/posts/?search=django`

### Ordering

- By publish date (descending by default): `/api/posts/?ordering=-published_date`
- By title: `/api/posts/?ordering=title`
- By views: `/api/posts/?ordering=-views`
- By read time: `/api/posts/?ordering=read_time`
- Multiple ordering fields: `/api/posts/?ordering=category,-published_date`

## Pagination

Results are paginated with 10 items per page by default:
- `/api/posts/?page=2`

## Authentication

Authentication is required for:
- Creating, updating, and deleting posts (users can only edit or delete their own posts)
- Liking posts
- Accessing draft posts (only own drafts)
- Creating comments
- Replying to comments

## Development Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Create default categories:
   ```bash
   python create_default_category.py
   ```

5. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```bash
   python manage.py runserver
   ```

7. Access the API at http://localhost:8000/api/

## Testing

Run the test suite with:
```bash
python manage.py test
```

## Troubleshooting

If you encounter any issues with the API, check the debug endpoint at http://localhost:3000/debug in the frontend application for testing API functionality. 