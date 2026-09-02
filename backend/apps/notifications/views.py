from rest_framework import viewsets, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.models import Notification
from apps.tenants.permissions import IsSchoolActiveOrReadOnly

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'channel', 'is_read', 'sent_at']


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'Toutes les notifications ont été marquées comme lues.'})
