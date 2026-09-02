from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User, Membership, RoleChoices
from apps.users.serializers import (
    UserSerializer,
    CustomTokenObtainPairSerializer,
    RegisterSchoolSerializer,
    MembershipSerializer
)
from apps.tenants.permissions import IsSchoolAdmin, IsSchoolActiveOrReadOnly

class RegisterSchoolView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSchoolSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            user = result['user']
            school = result['school']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Établissement enregistré avec succès. Période d\'essai de 14 jours activée.',
                'school': {
                    'id': str(school.id),
                    'name': school.name,
                    'slug': school.slug,
                    'status': school.status,
                    'trial_ends_at': school.trial_ends_at,
                    'edu_system': school.edu_system
                },
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InviteUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSchoolAdmin, IsSchoolActiveOrReadOnly]

    def post(self, request):
        email = request.data.get('email')
        role = request.data.get('role')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        phone = request.data.get('phone', '')
        password = request.data.get('password', 'Scolyva2026!')

        if not email or not role:
            return Response({'error': 'L\'email et le rôle sont obligatoires.'}, status=status.HTTP_400_BAD_REQUEST)

        if role not in RoleChoices.values:
            return Response({'error': f'Rôle invalide. Rôles autorisés: {RoleChoices.values}'}, status=status.HTTP_400_BAD_REQUEST)

        school = getattr(request, 'school', None)
        if not school:
            return Response({'error': 'Contexte d\'école non identifié.'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'phone': phone
            }
        )
        if created:
            user.set_password(password)
            user.save()

        membership, m_created = Membership.objects.get_or_create(
            user=user,
            school=school,
            role=role,
            defaults={'is_active': True}
        )

        return Response({
            'message': f'Utilisateur {email} invité avec succès en tant que {role}.',
            'user': UserSerializer(user).data,
            'membership': MembershipSerializer(membership).data
        }, status=status.HTTP_201_CREATED if created or m_created else status.HTTP_200_OK)
