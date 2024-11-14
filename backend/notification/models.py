from django.db import models
from accounts.models import CustomUser

class Notification(models.Model):
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f'Notification from {self.sender}'
