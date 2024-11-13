# views for create attendance, partially update and delete attendance, and list all attendance records, view all users with proper error handling.
# views for create leave, partially update and delete leave, and list all leaves records, view all leaves for particular employee with proper error handling.

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
import logging

from accounts.models import CustomUser
from accounts.serializers import UserSerializer
from .models import Attendance, Leave
from .serializers import AttendanceSerializer, LeaveSerializer

logger = logging.getLogger(__name__)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response({"error": False, "message": "Successfully created", "data": serializer.data}, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            logger.error(f"Validation error during attendance creation: {str(e)}")
            return Response(
                {"error": True, "message": "Validation error", "details": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error during attendance creation: {str(e)}", exc_info=True)
            return Response(
                {"error": True, "message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        try:
            return self.update(request, *args, **kwargs)
        except ValidationError as e:
            logger.error(f"Validation error during attendance update: {str(e)}")
            return Response(
                {"error": True, "message": "Validation error", "details": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error during attendance update: {str(e)}", exc_info=True)
            return Response(
                {"error": True, "message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({"error": False, "message": "Successfully deleted!"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Unexpected error during attendance deletion: {str(e)}", exc_info=True)
            return Response(
                {"error": True, "message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response({"error": False, "message": "Successful" , "data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Unexpected error during attendance list retrieval: {str(e)}", exc_info=True)
            return Response(
                {"error": True, "message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'])
    def list_all_users(self, request):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response({"error": False, "message": "Successful" , "data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Unexpected error during user list retrieval: {str(e)}", exc_info=True)
            return Response(
                {"error": True, "message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"error": False, "message": "Successfully created", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"error": False, "message": "Some error occured", "data": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"error": False, "message": "Successfully deleted!"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='employee/(?P<employee_id>[^/.]+)')
    def list_leaves_for_employee(self, request, employee_id=None):
        """List all leaves for a specific employee with proper error handling."""
        try:
            leaves = Leave.objects.filter(employee_id=employee_id)
            if not leaves.exists():
                return Response({"error": True, "message": "No leaves found for this employee."}, status=status.HTTP_404_NOT_FOUND)
            serializer = self.get_serializer(leaves, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Leave.DoesNotExist:
            return Response({"error": True, "message": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)