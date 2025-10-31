# backend/opendrive/asgi.py
"""
ASGI config for opendrive project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'opendrive.settings')

application = get_asgi_application()