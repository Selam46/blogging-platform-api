from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Post, Category, Tag, Comment
from .serializers import PostSerializer, CategorySerializer, TagSerializer, CommentSerializer
from django.http import HttpResponse
from .permissions import IsAuthorOrReadOnly
from .filters import PostFilter
from django.utils.text import slugify
import logging

logger = logging.getLogger(__name__)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PostFilter
    search_fields = ['title', 'content', 'author__username', 'category__name', 'tags__name']
    ordering_fields = ['published_date', 'created_date', 'title', 'views', 'read_time']
    ordering = ['-published_date']
    lookup_field = 'slug'
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Processing create request from: {request.user}")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Content type: {request.content_type}")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request data type: {type(request.data)}")

        if not request.user.is_authenticated:
            logger.warning(f"Unauthenticated request")
            return Response({
                'error': 'Authentication required. Please log in again.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            data = request.data
            serializer = self.get_serializer(data=data)
            
            if serializer.is_valid():
                serializer.save(author=request.user)
                logger.info(f"Post created successfully by {request.user.username}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                logger.warning(f"Serializer validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.exception(f"Error creating post: {str(e)}")
            return Response({
                'error': f'Failed to create post: {str(e)}',
                'exception_type': str(type(e).__name__)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.views += 1
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving post: {str(e)}")
            return Response({"error": "Failed to retrieve post"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing posts: {str(e)}")
            return Response({"error": "Failed to retrieve posts"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, slug=None):
        post = self.get_object()
        user = request.user
        
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            return Response({'status': 'unliked'}, status=status.HTTP_200_OK)
        else:
            post.likes.add(user)
            return Response({'status': 'liked'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def drafts(self, request):
        try:
            logger.info(f"Drafts endpoint accessed. User authenticated: {request.user.is_authenticated}")

            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            logger.info(f"Authorization header exists: {bool(auth_header)}, length: {len(auth_header) if auth_header else 0}")
            
            if not request.user.is_authenticated:
                logger.warning("User not authenticated for drafts endpoint")
                return Response({'error': 'You must be authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

            logger.info(f"Fetching drafts for user: {request.user.username}")
            posts = Post.objects.filter(author=request.user, status='draft')
            logger.info(f"Found {posts.count()} drafts")
            
            page = self.paginate_queryset(posts)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(posts, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in drafts endpoint: {str(e)}")
            return Response(
                {"error": f"Failed to retrieve drafts: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Make categories publicly readable
    lookup_field = 'slug'
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing categories: {str(e)}")
            return Response({"error": "Failed to retrieve categories"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving category: {str(e)}")
            return Response({"error": "Failed to retrieve category"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]  # Make tags publicly readable
    lookup_field = 'slug'
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing tags: {str(e)}")
            return Response({"error": "Failed to retrieve tags"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving tag: {str(e)}")
            return Response({"error": "Failed to retrieve tag"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.filter(parent=None)  # Only top-level comments
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    
    def get_queryset(self):
        queryset = Comment.objects.filter(parent=None)
        post_id = self.request.query_params.get('post', None)
        if post_id is not None:
            queryset = queryset.filter(post_id=post_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reply(self, request, pk=None):
        parent_comment = self.get_object()
        data = request.data.copy()
        data['post'] = parent_comment.post.id
        data['parent'] = parent_comment.id
        
        serializer = CommentSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def home(request):
    return HttpResponse("Welcome to the Blogging Platform API!")
