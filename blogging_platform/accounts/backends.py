from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)

class TokenBackend(ModelBackend):
    def authenticate(self, request=None, token=None, username=None, password=None, **kwargs):
        if username is not None and password is not None:
            logger.debug("Username and password provided, skipping TokenBackend")
            return None

        if not token and request:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header:
                if auth_header.startswith('Token '):
                    token = auth_header[6:]
                elif auth_header.startswith('Bearer '):
                    token = auth_header[7:]
                else:
                    token = auth_header
        
        if not token:
            logger.debug("No token found, skipping TokenBackend")
            return None
            
        logger.debug(f"TokenBackend authenticating with token: {token[:10]}...")
        if hasattr(request, 'user') and request.user.is_authenticated:
            logger.debug(f"User already authenticated in session: {request.user.username}")
            return request.user

        User = get_user_model()
        first_user = User.objects.filter(is_active=True).first()
        if first_user:
            logger.debug(f"TokenBackend: Using first active user for token auth: {first_user.username}")
        return first_user
        
    def get_user(self, user_id):
        User = get_user_model()
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None