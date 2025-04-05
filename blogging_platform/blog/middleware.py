import logging

logger = logging.getLogger(__name__)

class AuthDebugMiddleware:
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        if request.path.startswith('/api/'):
            auth_header = request.META.get('HTTP_AUTHORIZATION', 'None')
            logger.info(f"Auth Debug - Path: {request.path}, Method: {request.method}")
            logger.info(f"Auth Debug - Auth Header: {auth_header[:10]}...")
            logger.info(f"Auth Debug - Is authenticated: {request.user.is_authenticated}")
            
            if request.user.is_authenticated:
                logger.info(f"Auth Debug - User: {request.user.username}")
        
        response = self.get_response(request)

        return response 