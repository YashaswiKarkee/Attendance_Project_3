# views for create attendance, partially update and delete attendance, and list all attendance records, view all users with proper error handling.
# views for create leave, partially update and delete leave, and list all leaves records, view all leaves for particular employee with proper error handling.

from datetime import timedelta
from django.db import DatabaseError
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
import logging


from accounts.models import CustomUser, Role
from accounts.serializers import UserSerializer
from notification.models import Notification
from .models import Attendance, Leave
from .serializers import AttendanceSerializer, LeaveSerializer
from django.utils import timezone

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
        try:
            kwargs['partial'] = True
            response = self.update(request, *args, **kwargs)
            
            # # Calculate working hours if both check-in and check-out times are available
            # if 'check_in_time' in response.data and 'check_out_time' in response.data:
            #     check_in_time = response.data['check_in_time']
            #     check_out_time = response.data['check_out_time']
            #     if check_in_time and check_out_time:
            #         working_hours = (check_out_time - check_in_time).total_seconds() / 3600
            #         response.data['working_hours'] = working_hours
            return Response({"error": False, "message": "Updated.", "data": response}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": True, "message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Attendance.DoesNotExist:
            return Response({"error": True, "message": "Attendance record not found for the specified date."}, status=status.HTTP_404_NOT_FOUND)
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
            
    @action(detail=False, methods=['get'], url_path='check-attendance')
    def check_attendance(self, request):
        user_id = request.query_params.get('user_id')
        date = request.query_params.get('date')
        
        if not user_id or not date:
            return Response({"error": True, "message": "user_id and date are required parameters."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(id=user_id)
            attendance_exists = Attendance.objects.filter(employee=user, date=date).exists()
            if attendance_exists:
                return Response({"error": True, "message": "Attendance exists for the user on the specified date."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": False, "message": "No attendance record found for the user on the specified date."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Unexpected error during attendance check: {str(e)}", exc_info=True)
            return Response(
                {"error": True, "message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    @action(detail=False, methods=['get'], url_path='get-attendance-id')
    def get_attendance_id(self, request):
        username = request.query_params.get('username')
        date = request.query_params.get('date')
        
        if not username or not date:
            return Response({"error": True, "message": "username and date are required parameters."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(username=username)
            attendance = Attendance.objects.get(employee=user, date=date)
            if attendance and attendance.status == 'A':
                return Response({"error": False, "message": "Attendance exists for the user on the specified date.", "id": attendance.id, "is_first": True}, status=status.HTTP_200_OK)
            elif attendance and attendance.status != 'A':
                return Response({"error": False, "message": "Attendance found second time.","id": attendance.id, "is_first": False}, status=status.HTTP_200_OK)
            else:
                return Response({"error": True, "message": "No attendance record found for the user on the specified date."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error while obtaining attendance id: {str(e)}", exc_info=True)
            return Response(
                {"error": True, "message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    @action(detail=False, methods=['get'], url_path='user-attendance/(?P<user_id>[^/.]+)')
    def get_user_attendance(self, request, user_id=None):
        """Get attendance records for a specific user with proper error handling."""
        try:
            user = CustomUser.objects.get(id=user_id)
            attendance_records = Attendance.objects.filter(employee=user)
            if not attendance_records.exists():
                return Response({"error": True, "message": "No attendance records found for this user."}, status=status.HTTP_404_NOT_FOUND)
            serializer = self.get_serializer(attendance_records, many=True)
            return Response({"error": False, "message": "Successful", "data": serializer.data}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": True, "message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error during user attendance retrieval: {str(e)}", exc_info=True)
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
            leave = serializer.save()

             # Create Notifications for all Managers and Administrators
            managers_and_admins = CustomUser.objects.filter(role__in=[Role.MANAGER, Role.ADMIN])
            for manager in managers_and_admins:
                Notification.objects.create(
                    receiver=manager,
                    content=f"Leave request created by {leave.employee.username} from {leave.start_date} to {leave.end_date}. Waiting for approval."
                )


            return Response(
                {"error": False, "message": "Leave successfully created", "data": serializer.data},
                status=status.HTTP_200_OK
            )
        
        return Response(
            {"error": True, "message": "Some error occurred", "data": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()

            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
                
            if instance.status == 'R':
                # Create Notification for the employee who created the leave
                Notification.objects.create(
                    receiver=instance.employee,
                    content=f"Your leave request from {instance.start_date} to {instance.end_date} has been rejected."
                )
                
                # start_date = instance.start_date
                end_date = instance.end_date
                current_date = timezone.now().date()
                while current_date <= end_date:
                    attendance_record = Attendance.objects.filter(employee=instance.employee, date=current_date)
                    if attendance_record.exists():
                        attendance_record.delete()
                    current_date += timedelta(days=1)
                
            if instance.status == 'A':  # If the leave is approved
                # Create Notification for the employee who created the leave
                Notification.objects.create(
                    receiver=instance.employee,
                    content=f"Your leave request from {instance.start_date} to {instance.end_date} has been accepted."
                )

                # Create Attendance records for the leave period if they don't already exist
                start_date = instance.start_date
                end_date = instance.end_date
                current_date = timezone.now().date()

                while current_date <= end_date:
                    # Check if Attendance record exists for this date
                    if not Attendance.objects.filter(employee=instance.employee, date=current_date).exists():
                        # If attendance does not exist, create it
                        Attendance.objects.create(
                            employee=instance.employee,
                            date=current_date,
                            status='O'  # 'O' for On Leave
                        )
                    current_date += timedelta(days=1)
                

            return Response(
                {"error": False, "message": "Successfully updated", "data": serializer.data},
                status=status.HTTP_200_OK
            )

        except ValidationError as e:
            # Catch validation errors and provide a detailed response
            return Response(
                {"error": True, "message": "Validation error occurred", "details": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )

        except DatabaseError:
            # Handle database errors specifically
            return Response(
                {"error": True, "message": "Database error occurred while updating the leave."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except Exception as e:
            # General exception catch for any other unexpected errors
            return Response(
                {"error": True, "message": "An unexpected error occurred.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Check if leave is already approved or rejected
        if instance.status in ['A', 'R']:  # 'A' stands for Approved, 'R' stands for Rejected
            return Response(
                {"error": True, "message": "Cannot delete leave that has already been approved or rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )

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
        
    @action(detail=False, methods=['get'], url_path='list-all-leaves')
    def list_all_leaves(self, request):
        employee_details = []
        """List all leaves in the database with proper error handling."""
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            for data in serializer.data:
                employee = CustomUser.objects.get(id=data['employee'])
                employee_details.append({
                    "employee_first_name": employee.first_name,
                    "employee_last_name": employee.last_name,
                    "employee_profile_picture": employee.profile_picture.url,
                    "id": data['id'],
                    "start_date": data['start_date'],
                    "end_date": data['end_date'],
                    "status": data['status'],
                    "reason": data['reason']
                })
            return Response({"error": False, "message": "Successful", "data": employee_details}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Unexpected error during leave list retrieval: {str(e)}", exc_info=True)
            return Response(
                {"error": True, "message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )