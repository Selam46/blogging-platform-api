from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.models import User
import uuid
import hashlib

def generate_token(user):
    user_id_str = str(user.id)
    unique_id = str(uuid.uuid4())
    timestamp = str(uuid.uuid1().time)
    token_seed = f"{user_id_str}-{unique_id}-{timestamp}"
    token = hashlib.sha256(token_seed.encode()).hexdigest()
    
    return token

@csrf_exempt
def register(request):
    if request.method == 'POST':
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                username = data.get('username', '')
                password1 = data.get('password1', '')
                password2 = data.get('password2', '')

                print(f"Register request: username={username}, content_type={request.content_type}")

                if password1 != password2:
                    return JsonResponse({'error': 'Passwords do not match'}, status=400)

                if User.objects.filter(username=username).exists():
                    return JsonResponse({'error': 'Username already exists'}, status=400)

                user = User.objects.create_user(username=username, password=password1)

                user.is_staff = True
                user.save()

                user.backend = 'django.contrib.auth.backends.ModelBackend'
                login(request, user)

                token = generate_token(user)
                
                response_data = {
                    'token': token,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'is_staff': user.is_staff
                    }
                }
                
                print(f"User registered successfully: {username}")
                return JsonResponse(response_data)

            else:
                form = UserCreationForm(request.POST)
                if form.is_valid():
                    form.save()
                    username = form.cleaned_data.get('username')
                    password = form.cleaned_data.get('password1')
                    user = authenticate(username=username, password=password)
                    login(request, user)
                    messages.success(request, 'Registration successful.')
                    return redirect('home')
                else:
                    return JsonResponse({'error': 'Invalid form data'}, status=400)
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return JsonResponse({'error': str(e)}, status=400)
    else:
        form = UserCreationForm()
    return render(request, 'accounts/register.html', {'form': form})

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:

            if request.content_type == 'application/json':
                data = json.loads(request.body)
                username = data.get('username', '')
                password = data.get('password', '')

                print(f"Login attempt: username={username}, content_type={request.content_type}")
                user = authenticate(request, username=username, password=password, backend='django.contrib.auth.backends.ModelBackend')
                
                if user is not None:
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                    login(request, user)

                    token = generate_token(user)
                    
                    response_data = {
                        'token': token,
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'is_staff': user.is_staff
                        }
                    }
                    
                    print(f"Login successful for: {username}")
                    return JsonResponse(response_data)
                else:
                    print(f"Login failed for: {username}")
                    return JsonResponse({'error': 'Invalid username or password'}, status=400)

            else:
                username = request.POST.get('username')
                password = request.POST.get('password')
                user = authenticate(request, username=username, password=password)
                if user is not None:
                    login(request, user)
                    messages.success(request, 'Login successful.')
                    return redirect('home')
                else:
                    messages.error(request, 'Invalid username or password.')
                    return JsonResponse({'error': 'Invalid username or password'}, status=400)
        except Exception as e:
            print(f"Login error: {str(e)}")
            return JsonResponse({'error': str(e)}, status=400)
    return render(request, 'accounts/login.html')

@csrf_exempt
def logout_view(request):
    logout(request)
    if request.content_type == 'application/json':
        return JsonResponse({'success': 'You have been logged out.'})
    messages.success(request, 'You have been logged out.')
    return render(request, 'accounts/logout.html')

@csrf_exempt
def token_refresh(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    token = generate_token(request.user)

    return JsonResponse({
        'token': token,
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'is_staff': request.user.is_staff
        }
    })  
