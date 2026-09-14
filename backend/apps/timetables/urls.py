from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.timetables.views import RoomViewSet, TimeSlotViewSet, TimetableViewSet, TimetableEntryViewSet

router = DefaultRouter()
router.register('rooms', RoomViewSet, basename='room')
router.register('time-slots', TimeSlotViewSet, basename='time-slot')
router.register('schedules', TimetableViewSet, basename='timetable')
router.register('entries', TimetableEntryViewSet, basename='timetable-entry')

urlpatterns = [
    path('', include(router.urls)),
]
