from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, UserViewSet, LeaveViewSet

# Create a router and register the viewsets
router = DefaultRouter()
router.register(r'get-attendance', AttendanceViewSet, basename='attendance')
router.register(r'list-users', UserViewSet, basename='user')
router.register(r'leaves', LeaveViewSet, basename='leave')

urlpatterns = [
    path('', include(router.urls)),
]
