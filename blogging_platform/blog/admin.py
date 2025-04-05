from django.contrib import admin
from .models import Post, Category, Tag, Comment

# Register models
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'published_date', 'views')
    list_filter = ('status', 'category', 'tags')
    search_fields = ('title', 'content', 'author__username')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'author', 'created_date', 'is_approved')
    list_filter = ('is_approved', 'created_date')
    search_fields = ('content', 'author__username', 'post__title')
