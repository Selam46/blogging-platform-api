import django_filters
from django.db.models import Q
from .models import Post

class PostFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')
    date_from = django_filters.DateFilter(field_name='published_date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='published_date', lookup_expr='lte')
    tags = django_filters.CharFilter(field_name='tags__name', lookup_expr='icontains')
    status = django_filters.ChoiceFilter(choices=Post.STATUS_CHOICES)
    min_read_time = django_filters.NumberFilter(field_name='read_time', lookup_expr='gte')
    max_read_time = django_filters.NumberFilter(field_name='read_time', lookup_expr='lte')
    
    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value) | 
            Q(content__icontains=value) |
            Q(excerpt__icontains=value) |
            Q(author__username__icontains=value) |
            Q(category__name__icontains=value) |
            Q(tags__name__icontains=value)
        ).distinct()
    
    class Meta:
        model = Post
        fields = {
            'author': ['exact'],
            'category': ['exact'],
            'published_date': ['exact'],
            'status': ['exact'],
            'read_time': ['exact', 'lte', 'gte'],
        } 