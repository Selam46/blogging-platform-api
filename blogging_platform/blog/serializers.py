from rest_framework import serializers
from .models import Post, Category, Tag, Comment
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

class CommentSerializer(serializers.ModelSerializer):
    author_detail = UserSerializer(source='author', read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_detail', 'parent', 'content', 
                 'created_date', 'is_approved', 'replies']
        read_only_fields = ['author', 'is_approved']
    
    def get_replies(self, obj):
        if obj.parent is None:  # Only get replies for top-level comments
            replies = Comment.objects.filter(parent=obj)
            return CommentSerializer(replies, many=True).data
        return []
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class PostSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    author_detail = UserSerializer(source='author', read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)
    like_count = serializers.ReadOnlyField()
    comments = CommentSerializer(many=True, read_only=True)
    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, required=False)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'content', 'excerpt', 'featured_image', 
                 'author', 'author_detail', 'category', 'category_detail', 
                 'tags', 'tags_detail', 'published_date', 'updated_date', 
                 'created_date', 'status', 'read_time', 'views', 'like_count', 'comments']
        read_only_fields = ['slug', 'read_time', 'views', 'like_count']
        
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        post = Post.objects.create(**validated_data)
        
        for tag in tags_data:
            post.tags.add(tag)
            
        return post
        
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if tags_data is not None:
            instance.tags.clear()
            for tag in tags_data:
                instance.tags.add(tag)
                
        instance.save()
        return instance
