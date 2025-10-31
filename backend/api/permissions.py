# backend/api/permissions.py
from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsOwnerOrShared(permissions.BasePermission):
    """
    Custom permission to allow owners or anyone with share link.
    """
    def has_object_permission(self, request, view, obj):
        # Allow access if user is owner
        if obj.owner == request.user:
            return True
        # Allow read access if file is shared
        if request.method in permissions.SAFE_METHODS and obj.is_shared:
            return True
        return False