from datetime import time
from django.db import models

from django.db import models
from django.forms import ValidationError
from django.utils import timezone
from accounts.models import CustomUser


class Attendance(models.Model):
    STATUS_CHOICES = [
        ('P', 'Present'),
        ('A', 'Absent'),
        ('L', 'Late'),
        ('O', 'On Leave'),
    ]
    
    employee = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="attendance")
    date = models.DateField(default=timezone.now)
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    out_of_sight_time = models.DurationField(null=True, blank=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES)
    working_hours = models.DurationField(null=True, blank=True)

    
    def __str__(self):
        return f"{self.employee} - {self.date} - {self.status}"

    class Meta:
        ordering = ['-date']
        unique_together = ('employee', 'date')  # Ensure each employee has only one attendance record per day


class Leave(models.Model):
    LEAVE_STATUS_CHOICES = [
        ('P', 'Pending'),
        ('A', 'Approved'),
        ('R', 'Rejected'),
    ]
    
    employee = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="leaves")
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=1, choices=LEAVE_STATUS_CHOICES, default='P')
    reason = models.TextField()

    def __str__(self):
        return f"{self.employee} - {self.start_date} to {self.end_date} - {self.get_status_display()}"

    