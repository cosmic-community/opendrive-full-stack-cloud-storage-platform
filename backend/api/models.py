# backend/api/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
import os
import uuid


def user_directory_path(instance, filename):
    """Generate file path for user uploads."""
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('users', str(instance.owner.id), filename)


class Folder(models.Model):
    """Model for organizing files into folders."""
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folders')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subfolders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['name', 'owner', 'parent']

    def __str__(self):
        return f"{self.owner.username}/{self.name}"

    def get_path(self):
        """Get full folder path."""
        if self.parent:
            return f"{self.parent.get_path()}/{self.name}"
        return self.name


class File(models.Model):
    """Model for storing file metadata."""
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=user_directory_path)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, blank=True, related_name='files')
    size = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    share_token = models.CharField(max_length=100, blank=True, null=True, unique=True)
    is_shared = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.owner.username}/{self.name}"

    def save(self, *args, **kwargs):
        """Override save to set file size and mime type."""
        if self.file:
            self.size = self.file.size
            # Set mime type based on extension
            ext = os.path.splitext(self.file.name)[1].lower()
            mime_types = {
                '.pdf': 'application/pdf',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.xls': 'application/vnd.ms-excel',
                '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                '.ppt': 'application/vnd.ms-powerpoint',
                '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.txt': 'text/plain',
                '.zip': 'application/zip',
                '.rar': 'application/x-rar-compressed',
            }
            self.mime_type = mime_types.get(ext, 'application/octet-stream')
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Override delete to remove file from storage."""
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)

    def generate_share_token(self):
        """Generate a unique share token for this file."""
        if not self.share_token:
            self.share_token = str(uuid.uuid4())
            self.is_shared = True
            self.save()
        return self.share_token


class UserStorage(models.Model):
    """Model for tracking user storage usage."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='storage')
    used_space = models.BigIntegerField(default=0)
    total_space = models.BigIntegerField(default=1073741824)  # 1GB default
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.used_space}/{self.total_space}"

    def update_usage(self):
        """Calculate and update storage usage."""
        total = File.objects.filter(
            owner=self.user,
            is_deleted=False
        ).aggregate(total=models.Sum('size'))['total'] or 0
        self.used_space = total
        self.save()

    def has_space_for(self, file_size):
        """Check if user has enough space for a new file."""
        return (self.used_space + file_size) <= self.total_space

    def get_usage_percentage(self):
        """Get storage usage as percentage."""
        if self.total_space == 0:
            return 0
        return (self.used_space / self.total_space) * 100