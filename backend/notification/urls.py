from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

# Create a router and register the NotificationViewSet
router = DefaultRouter()
router.register(r'get-notification', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
