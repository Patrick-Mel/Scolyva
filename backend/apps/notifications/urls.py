from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.notifications.views import NotificationViewSet, MarkAllNotificationsReadView

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('mark-all-read/', MarkAllNotificationsReadView.as_view(), name='notifications-mark-read'),
    path('', include(router.urls)),
]
