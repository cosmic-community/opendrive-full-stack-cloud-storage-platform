# backend/api/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from django.utils import timezone
from django.db.models import Q
from .models import File, Folder, UserStorage
from .serializers import (
    UserSerializer, RegisterSerializer, FileSerializer,
    FileUploadSerializer, FolderSerializer, UserStorageSerializer
)
from .permissions import IsOwner, IsOwnerOrShared
import os


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user and return JWT tokens."""
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current user information."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class FolderViewSet(viewsets.ModelViewSet):
    """ViewSet for Folder operations."""
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        """Return folders for current user only."""
        return Folder.objects.filter(
            owner=self.request.user,
            is_deleted=False
        )

    def perform_create(self, serializer):
        """Set owner when creating folder."""
        serializer.save(owner=self.request.user)

    def perform_destroy(self, instance):
        """Soft delete folder."""
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()

    @action(detail=True, methods=['get'])
    def contents(self, request, pk=None):
        """Get all files and subfolders in a folder."""
        folder = self.get_object()
        files = File.objects.filter(folder=folder, is_deleted=False)
        subfolders = Folder.objects.filter(parent=folder, is_deleted=False)
        
        return Response({
            'folder': FolderSerializer(folder).data,
            'files': FileSerializer(files, many=True, context={'request': request}).data,
            'subfolders': FolderSerializer(subfolders, many=True).data
        })


class FileViewSet(viewsets.ModelViewSet):
    """ViewSet for File operations."""
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        """Return files for current user only."""
        return File.objects.filter(
            owner=self.request.user,
            is_deleted=False
        )

    def get_serializer_class(self):
        """Use different serializer for upload."""
        if self.action == 'create':
            return FileUploadSerializer
        return FileSerializer

    def perform_create(self, serializer):
        """Set owner and update storage when creating file."""
        file_instance = serializer.save(owner=self.request.user)
        
        # Update user storage
        storage, created = UserStorage.objects.get_or_create(user=self.request.user)
        storage.update_usage()

    def perform_destroy(self, instance):
        """Soft delete file and update storage."""
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()
        
        # Update user storage
        storage, created = UserStorage.objects.get_or_create(user=instance.owner)
        storage.update_usage()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a file."""
        file_obj = self.get_object()
        
        if not os.path.exists(file_obj.file.path):
            raise Http404("File not found")
        
        response = FileResponse(
            open(file_obj.file.path, 'rb'),
            content_type=file_obj.mime_type
        )
        response['Content-Disposition'] = f'attachment; filename="{file_obj.name}"'
        return response

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Generate a share link for a file."""
        file_obj = self.get_object()
        token = file_obj.generate_share_token()
        
        serializer = FileSerializer(file_obj, context={'request': request})
        return Response({
            'share_url': serializer.data['share_url'],
            'share_token': token
        })

    @action(detail=True, methods=['post'])
    def unshare(self, request, pk=None):
        """Remove share link from a file."""
        file_obj = self.get_object()
        file_obj.is_shared = False
        file_obj.share_token = None
        file_obj.save()
        
        return Response({'message': 'File sharing disabled'})

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recently uploaded files."""
        files = self.get_queryset().order_by('-created_at')[:20]
        serializer = FileSerializer(files, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trash(self, request):
        """Get deleted files."""
        files = File.objects.filter(
            owner=request.user,
            is_deleted=True
        ).order_by('-deleted_at')
        serializer = FileSerializer(files, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a deleted file."""
        file_obj = get_object_or_404(
            File,
            pk=pk,
            owner=request.user,
            is_deleted=True
        )
        file_obj.is_deleted = False
        file_obj.deleted_at = None
        file_obj.save()
        
        # Update user storage
        storage, created = UserStorage.objects.get_or_create(user=request.user)
        storage.update_usage()
        
        serializer = FileSerializer(file_obj, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        """Permanently delete a file."""
        file_obj = get_object_or_404(
            File,
            pk=pk,
            owner=request.user,
            is_deleted=True
        )
        file_obj.delete()
        
        # Update user storage
        storage, created = UserStorage.objects.get_or_create(user=request.user)
        storage.update_usage()
        
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def shared_file(request, token):
    """Access a shared file via token."""
    file_obj = get_object_or_404(File, share_token=token, is_shared=True)
    
    if request.GET.get('download') == 'true':
        if not os.path.exists(file_obj.file.path):
            raise Http404("File not found")
        
        response = FileResponse(
            open(file_obj.file.path, 'rb'),
            content_type=file_obj.mime_type
        )
        response['Content-Disposition'] = f'attachment; filename="{file_obj.name}"'
        return response
    
    serializer = FileSerializer(file_obj, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_files(request):
    """Search files by name."""
    query = request.GET.get('q', '')
    if not query:
        return Response([])
    
    files = File.objects.filter(
        Q(name__icontains=query) | Q(mime_type__icontains=query),
        owner=request.user,
        is_deleted=False
    )
    
    serializer = FileSerializer(files, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def storage_info(request):
    """Get storage information for current user."""
    storage, created = UserStorage.objects.get_or_create(user=request.user)
    storage.update_usage()
    
    serializer = UserStorageSerializer(storage)
    return Response(serializer.data)