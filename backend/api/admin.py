# backend/api/admin.py
from django.contrib import admin
from .models import File, Folder, UserStorage


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'folder', 'size', 'created_at', 'is_deleted']
    list_filter = ['is_deleted', 'is_shared', 'created_at']
    search_fields = ['name', 'owner__username']
    readonly_fields = ['created_at', 'updated_at', 'size', 'mime_type']


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'parent', 'created_at', 'is_deleted']
    list_filter = ['is_deleted', 'created_at']
    search_fields = ['name', 'owner__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserStorage)
class UserStorageAdmin(admin.ModelAdmin):
    list_display = ['user', 'used_space', 'total_space', 'get_usage_percentage', 'updated_at']
    readonly_fields = ['used_space', 'updated_at']
    
    def get_usage_percentage(self, obj):
        return f"{obj.get_usage_percentage():.1f}%"
    get_usage_percentage.short_description = 'Usage %'