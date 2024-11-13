# chat/urls.py
from django.urls import path

from . import views


urlpatterns = [
    path("<int:id>/", views.index, name="index"),
    path("room/<int:sender_id>/<int:receiver_id>/", views.room, name="room"),
]