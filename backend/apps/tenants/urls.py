from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.tenants.views import (
    CurrentSchoolView,
    SubscriptionPlanViewSet,
    SuperAdminSchoolViewSet,
    SuperAdminStatsView,
    SubscribeSchoolPlanView
)

router = DefaultRouter()
router.register(r'plans', SubscriptionPlanViewSet, basename='subscription-plans')
router.register(r'admin/schools', SuperAdminSchoolViewSet, basename='admin-schools')

urlpatterns = [
    path('school/current/', CurrentSchoolView.as_view(), name='current-school'),
    path('school/subscribe/', SubscribeSchoolPlanView.as_view(), name='subscribe-school'),
    path('admin/stats/', SuperAdminStatsView.as_view(), name='admin-stats'),
    path('', include(router.urls)),
]
