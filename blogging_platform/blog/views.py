from django.shortcuts import render
from rest_framework import viewsets
from .models import Post, Category, Tag
from .serializers import PostSerializer, CategorySerializer, TagSerializer
from django.http import HttpResponse

# Create your views here.

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

def home(request):
    return HttpResponse("Welcome to the Blogging Platform API!")
