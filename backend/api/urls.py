# backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'folders', views.FolderViewSet, basename='folder')
router.register(r'files', views.FileViewSet, basename='file')

urlpatterns = [
    # Authentication
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', views.current_user, name='current_user'),
    
    # Storage
    path('storage/', views.storage_info, name='storage_info'),
    
    # Search
    path('search/', views.search_files, name='search_files'),
    
    # Shared files
    path('files/shared/<str:token>/', views.shared_file, name='shared_file'),
    
    # Router URLs
    path('', include(router.urls)),
]