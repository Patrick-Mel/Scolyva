from django.urls import path
from apps.attendance.views import BulkAttendanceEntryView

urlpatterns = [
    path('take-attendance/', BulkAttendanceEntryView.as_view(), name='take-attendance'),
]
