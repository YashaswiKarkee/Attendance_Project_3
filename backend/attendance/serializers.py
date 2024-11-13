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
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Leave
        fields = ['id', 'employee', 'start_date', 'end_date', 'status', 'status_display', 'reason']
        read_only_fields = ['status_display']


