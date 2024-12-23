import logging
import os
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import UserRegistrationSerializer, LoginSerializer
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout
from deepface import DeepFace
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.pagination import PageNumberPagination

# Set up logging
logger = logging.getLogger(__name__)

@api_view(['POST'])
def register_user(request):
    if request.method == 'POST':
        # Validate required fields for user registration
        if 'email' not in request.data or 'password' not in request.data:
            logger.debug("Missing email or password in request data.")
            return Response(
                {"error": "Email and password are required fields."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Try to serialize and validate the input data
            serializer = UserRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                # Save user data
                user = serializer.save()

                # Handle profile pictures if provided
                image_fields = ['profile_picture', 'up', 'down', 'left', 'right']
                for field in image_fields:
                    if field in request.FILES:
                        image_response = handle_profile_picture(user, request.FILES[field], field)
                        if image_response:
                            return image_response

                return Response(
                    {"error": False, **serializer.data},
                    status=status.HTTP_201_CREATED
                )
            else:
                logger.debug(f"Invalid user data: {serializer.errors}")
                return Response(
                    {"error": True, "message": "Invalid user data", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValidationError as e:
            logger.error(f"Validation error: {str(e)}")
            return Response(
                {"error": True, "message": f"Validation error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return Response(
                {"error": True, "message": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

def handle_profile_picture(user, profile_picture, field_name):
    try:
        # Validate image file type (only JPEG and PNG allowed)
        if not profile_picture.name.endswith(('.png', '.jpg', '.jpeg')):
            logger.debug("Invalid image format.")
            return Response(
                {"error": "Invalid image format. Only PNG, JPG, and JPEG are allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create a directory for the user if it doesn't exist
        user_directory = os.path.join(settings.MEDIA_ROOT, 'profile_pics', user.username)
        if not os.path.exists(user_directory):
            os.makedirs(user_directory)

        # Determine the new file name with increment if necessary
        file_extension = os.path.splitext(profile_picture.name)[1]
        base_file_name = f"{user.username}_{field_name}"
        new_file_name = base_file_name + file_extension
        counter = 1
        while os.path.exists(os.path.join(user_directory, new_file_name)):
            new_file_name = f"{base_file_name}({counter}){file_extension}"
            counter += 1

        # Save the profile picture
        profile_picture.name = new_file_name
        setattr(user, field_name, profile_picture)
        user.save()

        # Move the file to the user's directory
        profile_picture_path = os.path.join(user_directory, new_file_name)
        with open(profile_picture_path, 'wb') as f:
            for chunk in profile_picture.chunks():
                f.write(chunk)

    except Exception as e:
        logger.error(f"Error saving profile picture: {str(e)}", exc_info=True)
        return Response(
            {"error": f"Error saving profile picture: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return None

@api_view(['POST'])
def login_user(request):
    if request.method == 'POST':
        # Ensure the required fields are present in the request
        if 'email' not in request.data or 'password' not in request.data:
            return Response(
                {"error": "Both email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate the input data using LoginSerializer
        serializer = LoginSerializer(data=request.data)
        try:
            if serializer.is_valid(raise_exception=True):
                email = serializer.validated_data['email']
                password = serializer.validated_data['password']

                # Try to authenticate the user
                user = authenticate(email=email, password=password)
                
                if user is not None:
                    # Login the user and return a success response
                    login(request, user)
                    return Response(
                        {
                            "error": False,
                            "message": "Login successful",
                            "profile_picture": user.profile_picture.url if user.profile_picture else None,
                            "id": user.id,
                            "role": user.role,
                            "email": user.email,
                            "username": user.username,
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                            "profile_picture": user.profile_picture.url if user.profile_picture else None,
                            "date_joined": user.date_joined,
                            "last_login": user.last_login,
                        },
                        status=status.HTTP_200_OK
                    )
                else:
                    return Response(
                        {"error":True,"message": "Invalid email or password."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
        except ValidationError as e:
            # Handle validation errors from the serializer
            return Response(
                {"error": True, "message": f"Invalid data provided: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Catch unexpected errors and return a general error response
            return Response(
                {"error": True, "message": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
@api_view(['POST'])
def logout_user(request):
    if request.method == 'POST':
        if request.user.is_authenticated:
            try:
                # Log the user out by clearing the session data
                logout(request)
                
                # Return a success message
                return Response(
                    {"error": False, "message": "Logout successful."},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                # If there is an error during the logout process
                return Response(
                    {"error": True, "message": f"An unexpected error occurred: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            return Response(
                {"error": True, "message": "Already Logged out."},
                status=status.HTTP_400_BAD_REQUEST
            )
        




@api_view(['POST'])
def login_with_face(request):
    if request.method == 'POST':
        if 'image' not in request.FILES:
            return Response(
                {"error": True, "message": "Please provide an image for facial recognition."},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_image = request.FILES['image']
        logger.info(f"Received image: {uploaded_image.name}")
        temp_image_path = os.path.join(settings.MEDIA_ROOT, 'temp_image.jpg')

        try:
            with open(temp_image_path, 'wb') as f:
                for chunk in uploaded_image.chunks():
                    f.write(chunk)
            logger.info(f"Saved temporary image to {temp_image_path}")

            User = get_user_model()
            users = User.objects.all()
            
            if not users:
                return Response(
                    {"error": True, "message": "No users found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            best_match = None
            lowest_distance = float('inf')

            for user in users:
                if not user.profile_picture:
                    continue

                profile_picture_path = user.profile_picture.path
                logger.info(f"Comparing with profile picture of user {user.id}")

                try:
                    # Use DeepFace.find to get a list of matches
                    results = DeepFace.find(temp_image_path, db_path=settings.MEDIA_ROOT + '/profile_pics', model_name='Facenet')
                    
                    if results:
                        # Sort results by distance to find the best match
                        df = results[0]
                        df_sorted = df.sort_values(by="distance", ascending=True)
                        best_match_record = df_sorted.iloc[0]
                        current_distance = best_match_record['distance']
                        
                        # Update best match if this distance is lower
                        if current_distance < lowest_distance:
                            lowest_distance = current_distance
                            best_match = user

                except Exception as e:
                    logger.warning(f"Failed to verify face for user {user.id}: {str(e)}")
                    continue

            # Check if we found a match within acceptable threshold
            if best_match and lowest_distance < 0.6:  # You can adjust this threshold
                login(request, best_match)
                user_data = {
                    "id": best_match.id,
                    "first_name": best_match.first_name,
                    "username": best_match.username,
                    "last_name": best_match.last_name,
                    "email": best_match.email,
                    "role": best_match.role,
                    "profile_picture": best_match.profile_picture.url if best_match.profile_picture else None,
                    "date_joined": best_match.date_joined,
                    "last_login": best_match.last_login,
                    "is_active": best_match.is_active,
                }

                return Response(
                    {
                        "error": False,
                        "message": "Login successful via facial recognition.",
                        "user_data": user_data
                    },
                    status=status.HTTP_200_OK
                )

            return Response(
                {"error": True, "message": "No matching face found or confidence too low."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        except Exception as e:
            logger.error(f"An error occurred during face verification: {str(e)}")
            return Response(
                {"error": True, "message": f"An error occurred during face verification: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        finally:
            if os.path.exists(temp_image_path):
                os.remove(temp_image_path)
                logger.info(f"Deleted temporary image: {temp_image_path}")


class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
def list_users(request):
    """
    API to list all users with pagination.
    """
    try:
        # Get the user model dynamically (supports custom user models)
        User = get_user_model()
        # Fetch all users from the database
        users = User.objects.all()
        
        # Apply pagination
        paginator = UserPagination()
        paginated_users = paginator.paginate_queryset(users, request)
        
        # Serialize user data
        user_data = []
        for user in paginated_users:
            user_data.append({
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role,
                "profile_picture": user.profile_picture.url if user.profile_picture else None,
                "date_joined": user.date_joined,
                "last_login": user.last_login,
                "is_active": user.is_active,
            })
        
        return paginator.get_paginated_response(user_data)
    except Exception as e:
        logger.error(f"An error occurred while fetching users: {str(e)}")
        return Response(
            {"error": True, "message": f"An error occurred while fetching users: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )