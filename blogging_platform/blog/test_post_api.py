import os
import json
import django
import requests
import logging

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blogging_platform.settings')
django.setup()

from django.contrib.auth.models import User
from blog.models import Category, Post, Tag

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_create_post():

    username = "testuser"
    password = "testpassword123"

    try:
        user = User.objects.get(username=username)
        logger.info(f"Using existing user: {username}")
    except User.DoesNotExist:
        user = User.objects.create_user(username=username, password=password)
        user.is_staff = True
        user.save()
        logger.info(f"Created new test user: {username}")

    category, created = Category.objects.get_or_create(
        name="Test Category",
        defaults={"slug": "test-category"}
    )
    logger.info(f"Using category: {category.name} (id={category.id})")

    login_url = "http://localhost:8000/accounts/login/"
    login_data = {
        "username": username,
        "password": password
    }
    
    try:
        logger.info("Attempting to log in and get token...")
        login_response = requests.post(login_url, json=login_data)
        
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            logger.info(f"Successfully logged in, token: {token[:10]}...")
        else:
            logger.error(f"Login failed with status {login_response.status_code}")
            logger.error(f"Response: {login_response.text}")
            return
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        return

    post_data = {
        "title": "Test Post from API Script",
        "content": "This is a test post created by the API test script.",
        "excerpt": "Test post excerpt",
        "category": category.id,
        "tag_names": "test,api,script",
        "status": "published"
    }

    create_url = "http://localhost:8000/api/posts/"
    headers = {
        "Content-Type": "application/json",
        "Authorization": token
    }
    
    try:
        logger.info("Attempting to create a post...")
        logger.info(f"Request data: {post_data}")
        
        response = requests.post(create_url, json=post_data, headers=headers)
        
        logger.info(f"Response status: {response.status_code}")
        
        if response.status_code == 201:
            logger.info("Post created successfully!")
            logger.info(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            logger.error(f"Post creation failed with status {response.status_code}")
            logger.error(f"Response: {response.text}")
    except Exception as e:
        logger.error(f"Error creating post: {str(e)}")

if __name__ == "__main__":
    logger.info("Starting API test...")
    test_create_post()
    logger.info("API test completed.") 