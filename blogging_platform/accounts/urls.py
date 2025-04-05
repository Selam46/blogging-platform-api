from django.urls import path
from .views import register, login_view, logout_view, token_refresh

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('token/refresh/', token_refresh, name='token_refresh'),
]
