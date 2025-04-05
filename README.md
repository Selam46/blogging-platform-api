# Blogging Platform

A blogging platform with a Django REST Framework backend API and a React frontend.

## Project Structure

- **blogging_platform/**: Django backend application
  - RESTful API for blog posts, comments, categories, tags, and user authentication
  - Advanced filtering, searching, and pagination capabilities
  - Comprehensive permissions and authentication system
  
- **frontend/**: React frontend application
  - Modern user interface with Bootstrap styling
  - Complete user authentication flow
  - Features for creating, editing, and managing blog posts
  - Commenting and interaction features

## Features

### Backend Features
- User authentication (register, login, logout)
- Post management (CRUD operations)
- Comment system with nested replies
- Categories and tags for post organization
- Advanced filtering and full-text search
- Post features: featured images, status (draft/published), read time, view tracking, likes

### Frontend Features
- Responsive design using Bootstrap
- User authentication with token-based security
- Post creation and editing with rich text capabilities
- Draft management for authors
- Post discovery by category, author, or tags
- Dynamic commenting system
- User profiles
- Search functionality

## Getting Started

### Backend Setup

1. Clone the repository:
   ```
   git clone [repository-url]
   cd blogging-platform-api
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   cd blogging_platform
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

6. Create default categories:
   ```
   python create_default_category.py
   ```

7. Start the backend server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd blogging_platform/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## API Documentation

For detailed API documentation, please refer to [blogging_platform/README.md](blogging_platform/README.md).

## Troubleshooting

For issues related to the API, check [blogging_platform/frontend/API_TROUBLESHOOTING.md](blogging_platform/frontend/API_TROUBLESHOOTING.md).

## License

This project is licensed under the MIT License. 