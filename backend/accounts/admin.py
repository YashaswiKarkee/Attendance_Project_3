from django.contrib import admin
from .models import CustomUser
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

# Customize the admin interface
admin.site.site_header = _("Attendance Management System")
admin.site.site_title = _("Attendance Management System")
admin.site.index_title = _("Welcome to Attendance Management System using facial recognition")

admin.site.register(CustomUser)

