from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Ensure only 'is_read' field is updated
        if 'is_read' in request.data:
            serializer = self.get_serializer(instance, data={'is_read': request.data['is_read']}, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({"error": False, "message": "Notification updated successfully.", "data": serializer.data},
                            status=status.HTTP_200_OK)
        else:
            return Response({"error": True, "message": "Only the 'is_read' field can be updated."},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='receiver/(?P<receiver>[^/.]+)')
    def get_notifications_by_receiver(self, request, receiver=None):
        # Retrieve notifications for the specified receiver
        notifications = Notification.objects.filter(receiver=receiver)
        serializer = self.get_serializer(notifications, many=True)
        return Response({"error": False, "message": "Notifications retrieved successfully.", "data": serializer.data},
                        status=status.HTTP_200_OK)
