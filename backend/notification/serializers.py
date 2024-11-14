from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

    def update(self, instance, validated_data):
        # Only allow updating the 'is_read' field
        if 'is_read' in validated_data:
            instance.is_read = validated_data['is_read']
        instance.save()
        return instance