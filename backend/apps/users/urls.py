from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import RegisterSchoolView, CustomLoginView, MeView, InviteUserView

urlpatterns = [
    path('register-school/', RegisterSchoolView.as_view(), name='register-school'),
    path('login/', CustomLoginView.as_view(), name='token-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='user-me'),
    path('invite/', InviteUserView.as_view(), name='user-invite'),
]
