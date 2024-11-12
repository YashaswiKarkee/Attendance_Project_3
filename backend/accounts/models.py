# import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone


# Custom User Manager
class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, first_name=None, last_name=None, role='Employee'):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, first_name=first_name, last_name=last_name, role=role)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, first_name=None, last_name=None):
        user = self.create_user(email, username, password, first_name, last_name, role='Admin')
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(using=self._db)
        return user


# Role Choices
class Role(models.TextChoices):
    ADMIN = 'Admin', 'Administrator'
    EMPLOYEE = 'Employee', 'Employee'
    MANAGER = 'Manager', 'Manager'

# User model
class CustomUser(AbstractUser):
    # id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    face_encoding = models.BinaryField(blank=True, null=True)  # Store face encoding for recognition
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.EMPLOYEE
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    objects = UserManager()

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        # Role-based permission handling
        return self.role == Role.ADMIN

    def has_module_perms(self, app_label):
        # Role-based permission handling
        return self.role == Role.ADMIN
