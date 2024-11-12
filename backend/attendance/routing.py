from django.urls import path
from .consumers import FaceRecognitionConsumer

websocket_urlpatterns = [
    path('ws/attendance/', FaceRecognitionConsumer.as_asgi()),
]
