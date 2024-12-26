from datetime import datetime
from django.utils import timezone
from rest_framework import serializers

from accounts.models import CustomUser

from .models import Attendance, Leave

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'




class LeaveSerializer(serializers.ModelSerializer):
    # Display `employee` details as a nested object, or alternatively, use `PrimaryKeyRelatedField`
    employee = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    status = serializers.ChoiceField(choices=Leave.LEAVE_STATUS_CHOICES, default='P')

    class Meta:
        model = Leave
        fields = ['id', 'employee', 'start_date', 'end_date', 'status', 'reason']
        
    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        current_date = timezone.now().date()
        current_time = timezone.now().time()

        # Check if start date is today and time is before 7:00 AM
        if start_date == current_date and current_time <= datetime.strptime("07:00", "%H:%M").time():
            raise serializers.ValidationError("Start date cannot be before 7 AM today.")
        
        if start_date < current_date:
            raise serializers.ValidationError("Start date cannot be in the past.")
        
        # Check if end date is before start date
        if end_date and end_date < start_date:
            raise serializers.ValidationError("End date cannot be earlier than start date.")
        
        return data


