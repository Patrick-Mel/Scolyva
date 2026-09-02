from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
import uuid

from apps.finances.models import FeeCategory, FeeStructure, StudentBalance, Payment, PaymentStatusChoices
from apps.finances.serializers import (
    FeeCategorySerializer, FeeStructureSerializer, StudentBalanceSerializer,
    PaymentSerializer, InitiatePaymentSerializer
)
from apps.academics.models import Student
from apps.tenants.permissions import IsSchoolActiveOrReadOnly, IsAccountant, IsParent

class FeeCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = FeeCategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        return FeeCategory.objects.filter(school=school) if school else FeeCategory.objects.none()


class FeeStructureViewSet(viewsets.ModelViewSet):
    serializer_class = FeeStructureSerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        return FeeStructure.objects.filter(school=school) if school else FeeStructure.objects.none()


class StudentBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StudentBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if not school:
            return StudentBalance.objects.none()

        queryset = StudentBalance.objects.filter(school=school)
        class_room_id = self.request.query_params.get('class_room')
        if class_room_id:
            queryset = queryset.filter(student__class_room_id=class_room_id)

        in_debt = self.request.query_params.get('in_debt')
        if in_debt == 'true':
            queryset = queryset.filter(balance_remaining__gt=0)

        return queryset


class FinancialOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAccountant]

    def get(self, request):
        school = getattr(request, 'school', None)
        if not school:
            return Response({'error': 'Établissement requis.'}, status=status.HTTP_400_BAD_REQUEST)

        balances = StudentBalance.objects.filter(school=school)
        total_expected = sum(b.total_due for b in balances)
        total_collected = sum(b.total_paid for b in balances)
        total_remaining = sum(b.balance_remaining for b in balances)
        recovery_rate = (total_collected / total_expected * 100) if total_expected > 0 else 0.0

        students_in_debt = balances.filter(balance_remaining__gt=0).count()
        total_students = balances.count()

        return Response({
            'total_expected_xaf': total_expected,
            'total_collected_xaf': total_collected,
            'total_remaining_xaf': total_remaining,
            'recovery_rate_percent': round(recovery_rate, 2),
            'students_in_debt_count': students_in_debt,
            'total_students_count': total_students
        })


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if not school:
            return Payment.objects.none()

        queryset = Payment.objects.filter(school=school)
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        return queryset

    @transaction.atomic
    def perform_create(self, serializer):
        school = getattr(self.request, 'school', None)
        trans_ref = f"PAY-{uuid.uuid4().hex[:10].upper()}"
        receipt_num = f"REC-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        
        payment = serializer.save(
            school=school,
            transaction_ref=trans_ref,
            receipt_number=receipt_num,
            status=PaymentStatusChoices.COMPLETED,
            paid_at=timezone.now()
        )

        # Automatically update student balance
        balance, _ = StudentBalance.objects.get_or_create(school=school, student=payment.student)
        balance.recalculate()


class InitiateCinetPayPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        school = getattr(request, 'school', None)
        
        try:
            student = Student.objects.get(id=data['student_id'])
        except Student.DoesNotExist:
            return Response({'error': 'Élève introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if not school:
            school = student.school

        trans_ref = f"CP-{school.slug.upper()}-{uuid.uuid4().hex[:8].upper()}"

        payment = Payment.objects.create(
            school=school,
            student=student,
            fee_structure_id=data.get('fee_structure_id'),
            amount=data['amount'],
            payment_method=data.get('payment_method', 'CINETPAY_OM'),
            status=PaymentStatusChoices.PENDING,
            transaction_ref=trans_ref
        )

        # CinetPay Checkout Simulation URL
        payment_link = f"https://checkout.cinetpay.com/pay/{trans_ref}"

        return Response({
            'message': 'Paiement CinetPay initialisé avec succès.',
            'payment_id': str(payment.id),
            'transaction_ref': trans_ref,
            'amount': payment.amount,
            'payment_url': payment_link
        }, status=status.HTTP_201_CREATED)


class CinetPayWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        cpay_trans_id = request.data.get('cpay_custom') or request.data.get('transaction_id')
        cpay_status = request.data.get('cpay_result_status') or request.data.get('status', 'ACCEPTED')

        if not cpay_trans_id:
            return Response({'error': 'Id de transaction manquant.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(transaction_ref=cpay_trans_id)
        except Payment.DoesNotExist:
            return Response({'error': 'Transaction introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if cpay_status in ('ACCEPTED', 'SUCCESS', '00'):
            payment.status = PaymentStatusChoices.COMPLETED
            payment.paid_at = timezone.now()
            payment.receipt_number = f"REC-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
            payment.save()

            # Recalculate student balance
            balance, _ = StudentBalance.objects.get_or_create(school=payment.school, student=payment.student)
            balance.recalculate()

            return Response({'status': 'SUCCESS', 'message': 'Paiement validé avec succès.'}, status=status.HTTP_200_OK)
        else:
            payment.status = PaymentStatusChoices.FAILED
            payment.save()
            return Response({'status': 'FAILED', 'message': 'Échec du paiement.'}, status=status.HTTP_200_OK)
