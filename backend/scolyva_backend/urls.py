from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/tenants/', include('apps.tenants.urls')),
    path('api/v1/academics/', include('apps.academics.urls')),
    path('api/v1/finances/', include('apps.finances.urls')),
    path('api/v1/attendance/', include('apps.attendance.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/storage/', include('apps.storage.urls')),
    path('api/v1/timetables/', include('apps.timetables.urls')),
    path('api/v1/exams/', include('apps.exams.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
