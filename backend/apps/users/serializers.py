from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction
from django.utils.text import slugify
from django.utils import timezone
from datetime import timedelta

from apps.users.models import User, Membership, RoleChoices
from apps.tenants.models import School, EducationalSystem, SchoolStatus

class MembershipSerializer(serializers.ModelSerializer):
    school_id = serializers.UUIDField(source='school.id', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)
    school_slug = serializers.CharField(source='school.slug', read_only=True)
    school_logo = serializers.CharField(source='school.logo_url', read_only=True)

    class Meta:
        model = Membership
        fields = ['id', 'school_id', 'school_name', 'school_slug', 'school_logo', 'role', 'is_active', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    memberships = MembershipSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'photo_url', 'is_superadmin', 'preferred_language', 'memberships']
        read_only_fields = ['id', 'is_superadmin']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_superadmin'] = user.is_superadmin
        token['preferred_language'] = user.preferred_language
        
        # Attach active memberships
        memberships = user.memberships.filter(is_active=True)
        token['memberships'] = [
            {
                'school_id': str(m.school.id),
                'school_slug': m.school.slug,
                'school_name': m.school.name,
                'role': m.role
            }
            for m in memberships
        ]
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class RegisterSchoolSerializer(serializers.Serializer):
    school_name = serializers.CharField(max_length=255)
    school_slug = serializers.CharField(max_length=100, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, default='Douala')
    phone = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    director_name = serializers.CharField(max_length=150)
    edu_system = serializers.ChoiceField(choices=EducationalSystem.choices, default=EducationalSystem.FRANCOPHONE)
    
    # Admin User Info
    admin_first_name = serializers.CharField(max_length=150)
    admin_last_name = serializers.CharField(max_length=150)
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(min_length=6, write_only=True)

    def validate_school_slug(self, value):
        if value:
            slug = slugify(value)
            if School.objects.filter(slug=slug).exists():
                raise serializers.ValidationError("Ce nom de domaine/sous-domaine est déjà utilisé.")
            return slug
        return value

    def validate_admin_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un compte existe déjà avec cette adresse email.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        # Generate slug if not provided
        slug_base = validated_data.get('school_slug') or slugify(validated_data['school_name'])
        slug = slug_base
        counter = 1
        while School.objects.filter(slug=slug).exists():
            slug = f"{slug_base}-{counter}"
            counter += 1

        # Create School with 14-day trial
        school = School.objects.create(
            name=validated_data['school_name'],
            slug=slug,
            city=validated_data.get('city', 'Douala'),
            phone=validated_data['phone'],
            email=validated_data['email'],
            director_name=validated_data['director_name'],
            edu_system=validated_data['edu_system'],
            status=SchoolStatus.TRIAL,
            trial_ends_at=timezone.now() + timedelta(days=14)
        )

        # Create Admin User
        user = User.objects.create_user(
            email=validated_data['admin_email'],
            password=validated_data['admin_password'],
            first_name=validated_data['admin_first_name'],
            last_name=validated_data['admin_last_name'],
            phone=validated_data['phone']
        )

        # Create Membership as SCHOOL_ADMIN
        membership = Membership.objects.create(
            user=user,
            school=school,
            role=RoleChoices.SCHOOL_ADMIN,
            is_active=True
        )

        return {
            'school': school,
            'user': user,
            'membership': membership
        }
