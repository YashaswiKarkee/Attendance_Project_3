from django.contrib import admin

from attendance.models import Attendance, Leave

admin.site.register(Attendance)
admin.site.register(Leave)