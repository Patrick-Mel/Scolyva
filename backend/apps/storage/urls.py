from django.urls import path
from apps.storage.views import PresignUploadView, PresignDownloadView

urlpatterns = [
    path('presign-upload/', PresignUploadView.as_view(), name='presign-upload'),
    path('presign-download/', PresignDownloadView.as_view(), name='presign-download'),
]
