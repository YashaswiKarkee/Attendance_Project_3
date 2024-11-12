from rest_framework import serializers
from .models import CustomUser
from django.core.exceptions import ValidationError

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'role', 'profile_picture']
    
    # Ensure password is strong and follows security standards
    def validate_password(self, value):
        if len(value) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        return value

    def create(self, validated_data):
        # Hash the password before saving the user
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'Employee')  # Default to 'Employee' role if not specified
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value
    
    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError("Password is required.")
        return value

