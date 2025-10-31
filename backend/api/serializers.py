# backend/api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import File, Folder, UserStorage


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        # Create storage record for new user
        UserStorage.objects.create(user=user)
        return user


class FolderSerializer(serializers.ModelSerializer):
    """Serializer for Folder model."""
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    path = serializers.SerializerMethodField()
    file_count = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = [
            'id', 'name', 'owner', 'owner_username', 'parent', 'parent_name',
            'path', 'file_count', 'created_at', 'updated_at', 'is_deleted'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def get_path(self, obj):
        return obj.get_path()

    def get_file_count(self, obj):
        return obj.files.filter(is_deleted=False).count()


class FileSerializer(serializers.ModelSerializer):
    """Serializer for File model."""
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    folder_name = serializers.CharField(source='folder.name', read_only=True, allow_null=True)
    file_url = serializers.SerializerMethodField()
    share_url = serializers.SerializerMethodField()
    size_formatted = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            'id', 'name', 'file', 'file_url', 'owner', 'owner_username',
            'folder', 'folder_name', 'size', 'size_formatted', 'mime_type',
            'created_at', 'updated_at', 'is_deleted', 'is_shared',
            'share_token', 'share_url'
        ]
        read_only_fields = [
            'id', 'owner', 'size', 'mime_type', 'created_at', 'updated_at',
            'share_token'
        ]

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_share_url(self, obj):
        if obj.is_shared and obj.share_token:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f'/api/files/shared/{obj.share_token}/')
        return None

    def get_size_formatted(self, obj):
        """Format file size in human-readable format."""
        size = obj.size
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} PB"


class FileUploadSerializer(serializers.ModelSerializer):
    """Serializer for file uploads."""
    class Meta:
        model = File
        fields = ['id', 'name', 'file', 'folder']

    def validate_file(self, value):
        """Validate file size against user's storage limit."""
        request = self.context.get('request')
        if request and request.user:
            storage, created = UserStorage.objects.get_or_create(user=request.user)
            if not storage.has_space_for(value.size):
                raise serializers.ValidationError(
                    f"Not enough storage space. You have {storage.total_space - storage.used_space} bytes available."
                )
        return value


class UserStorageSerializer(serializers.ModelSerializer):
    """Serializer for UserStorage model."""
    username = serializers.CharField(source='user.username', read_only=True)
    used_formatted = serializers.SerializerMethodField()
    total_formatted = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    file_count = serializers.SerializerMethodField()
    folder_count = serializers.SerializerMethodField()

    class Meta:
        model = UserStorage
        fields = [
            'id', 'username', 'used_space', 'used_formatted',
            'total_space', 'total_formatted', 'percentage',
            'file_count', 'folder_count', 'updated_at'
        ]
        read_only_fields = ['id', 'used_space', 'updated_at']

    def get_used_formatted(self, obj):
        size = obj.used_space
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    def get_total_formatted(self, obj):
        size = obj.total_space
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    def get_percentage(self, obj):
        return round(obj.get_usage_percentage(), 1)

    def get_file_count(self, obj):
        return File.objects.filter(owner=obj.user, is_deleted=False).count()

    def get_folder_count(self, obj):
        return Folder.objects.filter(owner=obj.user, is_deleted=False).count()