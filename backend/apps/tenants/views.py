from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
import uuid

from apps.tenants.models import School, SubscriptionPlan, SchoolSubscription, PlatformPayment, SchoolStatus
from apps.tenants.serializers import (
    SchoolSerializer,
    SubscriptionPlanSerializer,
    SchoolSubscriptionSerializer,
    PlatformPaymentSerializer
)
from apps.tenants.permissions import IsSuperAdmin, IsSchoolAdmin, IsSchoolActiveOrReadOnly
from apps.users.models import User

class CurrentSchoolView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get(self, request):
        school = getattr(request, 'school', None)
        if not school:
            membership = request.user.memberships.filter(is_active=True).first()
            if membership:
                school = membership.school

        if not school:
            return Response({'error': 'Aucun établissement associé trouvé.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = SchoolSerializer(school)
        return Response(serializer.data)

    def patch(self, request):
        school = getattr(request, 'school', None)
        if not school:
            return Response({'error': 'Établissement non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = SchoolSerializer(school, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [permissions.AllowAny()]


class SuperAdminSchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all().order_by('-created_at')
    serializer_class = SchoolSerializer
    permission_classes = [IsSuperAdmin]


class SuperAdminStatsView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        total_schools = School.objects.count()
        active_schools = School.objects.filter(status=SchoolStatus.ACTIVE).count()
        trial_schools = School.objects.filter(status=SchoolStatus.TRIAL).count()
        read_only_schools = School.objects.filter(status=SchoolStatus.READ_ONLY).count()
        total_users = User.objects.count()

        total_revenue = sum(p.amount for p in PlatformPayment.objects.filter(status='SUCCESS'))

        return Response({
            'total_schools': total_schools,
            'active_schools': active_schools,
            'trial_schools': trial_schools,
            'read_only_schools': read_only_schools,
            'total_users': total_users,
            'total_revenue_xaf': total_revenue
        })


class SubscribeSchoolPlanView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSchoolAdmin]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        school = getattr(request, 'school', None)

        if not school:
            membership = request.user.memberships.filter(is_active=True).first()
            if membership:
                school = membership.school

        if not school or not plan_id:
            return Response({'error': 'Établissement et plan requis.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({'error': 'Plan introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        trans_ref = f"SUB-{school.slug.upper()}-{uuid.uuid4().hex[:8].upper()}"

        payment = PlatformPayment.objects.create(
            school=school,
            plan=plan,
            amount=plan.price_xaf,
            transaction_ref=trans_ref,
            status='SUCCESS',  # Simulated payment success for instant activation
            payment_method='CINETPAY_OM_MOMO',
            paid_at=timezone.now()
        )

        # Create or extend subscription for 1 year
        SchoolSubscription.objects.create(
            school=school,
            plan=plan,
            status='ACTIVE',
            starts_at=timezone.now(),
            ends_at=timezone.now() + timedelta(days=365)
        )

        # Update school status to ACTIVE
        school.status = SchoolStatus.ACTIVE
        school.save()

        return Response({
            'message': f'Abonnement au plan {plan.name} activé avec succès pour 1 an !',
            'payment': PlatformPaymentSerializer(payment).data,
            'school_status': school.status
        }, status=status.HTTP_201_CREATED)
