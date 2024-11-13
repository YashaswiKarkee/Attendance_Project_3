from django.urls import path
from .views import *

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/credentials/', login_user, name='login_user_credentials'),
    path("list/", list_users, name="list_users"),
    path('login/face/', login_with_face, name='login_user_face'),
    path('logout/', logout_user, name='logout_user'),
]