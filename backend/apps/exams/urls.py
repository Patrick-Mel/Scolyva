from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.exams.views import ExamViewSet, ExamQuestionViewSet, ExamSubmissionViewSet

router = DefaultRouter()
router.register('evaluations', ExamViewSet, basename='exam')
router.register('questions', ExamQuestionViewSet, basename='exam-question')
router.register('submissions', ExamSubmissionViewSet, basename='exam-submission')

urlpatterns = [
    path('', include(router.urls)),
]
