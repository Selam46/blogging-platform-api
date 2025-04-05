from rest_framework import serializers
from .models import Post, Category, Tag, Comment
from django.contrib.auth.models import User
from django.utils.text import slugify

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
    tag_names = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'content', 'excerpt', 'featured_image', 
                 'author', 'author_detail', 'category', 'category_detail', 
                 'tags', 'tags_detail', 'tag_names', 'published_date', 'updated_date', 
                 'created_date', 'status', 'read_time', 'views', 'like_count', 'comments']
        read_only_fields = ['slug', 'read_time', 'views', 'like_count']
        
    def create(self, validated_data):
        try:
            print(f"Validated data: {validated_data}")

            tag_names = validated_data.pop('tag_names', '')
            tags_data = validated_data.pop('tags', [])

            if 'category' in validated_data and validated_data['category'] is None:
                validated_data.pop('category')
                print("Category was None and removed from validated data.")

            post = Post.objects.create(**validated_data)

            for tag in tags_data:
                post.tags.add(tag)
                print(f"Added tag with ID: {tag.id}")

            if tag_names:
                tag_list = [name.strip() for name in tag_names.split(',') if name.strip()]
                for tag_name in tag_list:
                    tag, created = Tag.objects.get_or_create(
                        name=tag_name,
                        defaults={'slug': slugify(tag_name)}
                    )
                    post.tags.add(tag)
                    print(f"Added tag with name: {tag_name}")
            
            return post
        except Exception as e:
            print(f"Error in PostSerializer.create: {str(e)}")
            raise
        
    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', '')
        tags_data = validated_data.pop('tags', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if tags_data is not None:
            instance.tags.clear()
            for tag in tags_data:
                instance.tags.add(tag)

        if tag_names:
            if tags_data is None:
                instance.tags.clear()
                
            tag_list = [name.strip() for name in tag_names.split(',') if name.strip()]
            for tag_name in tag_list:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name,
                    defaults={'slug': slugify(tag_name)}
                )
                instance.tags.add(tag)
                
        instance.save()
        return instance
