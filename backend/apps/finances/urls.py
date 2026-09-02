from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.finances.views import (
    FeeCategoryViewSet, FeeStructureViewSet, StudentBalanceViewSet,
    PaymentViewSet, FinancialOverviewView, InitiateCinetPayPaymentView,
    CinetPayWebhookView
)

router = DefaultRouter()
router.register(r'fee-categories', FeeCategoryViewSet, basename='fee-categories')
router.register(r'fee-structures', FeeStructureViewSet, basename='fee-structures')
router.register(r'balances', StudentBalanceViewSet, basename='student-balances')
router.register(r'payments', PaymentViewSet, basename='payments')

urlpatterns = [
    path('overview/', FinancialOverviewView.as_view(), name='financial-overview'),
    path('payments/initiate/', InitiateCinetPayPaymentView.as_view(), name='initiate-cinetpay'),
    path('payments/webhook/', CinetPayWebhookView.as_view(), name='cinetpay-webhook'),
    path('', include(router.urls)),
]
