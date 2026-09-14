from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.attendance.views import BulkAttendanceEntryView, AttendanceScanViewSet

router = DefaultRouter()
router.register('scans', AttendanceScanViewSet, basename='attendance-scan')

urlpatterns = [
    path('take-attendance/', BulkAttendanceEntryView.as_view(), name='take-attendance'),
    path('', include(router.urls)),
]
