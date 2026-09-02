from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.academics.views import (
    AcademicYearViewSet, LevelViewSet, ClassRoomViewSet,
    SubjectViewSet, ClassSubjectViewSet, SequenceViewSet,
    StudentViewSet, GradeViewSet, BulkGradeEntryView, GenerateReportCardsView
)

router = DefaultRouter()
router.register(r'years', AcademicYearViewSet, basename='academic-years')
router.register(r'levels', LevelViewSet, basename='levels')
router.register(r'classrooms', ClassRoomViewSet, basename='classrooms')
router.register(r'subjects', SubjectViewSet, basename='subjects')
router.register(r'class-subjects', ClassSubjectViewSet, basename='class-subjects')
router.register(r'sequences', SequenceViewSet, basename='sequences')
router.register(r'students', StudentViewSet, basename='students')
router.register(r'grades', GradeViewSet, basename='grades')

urlpatterns = [
    path('grades/bulk-entry/', BulkGradeEntryView.as_view(), name='bulk-grade-entry'),
    path('report-cards/generate/', GenerateReportCardsView.as_view(), name='generate-report-cards'),
    path('', include(router.urls)),
]
