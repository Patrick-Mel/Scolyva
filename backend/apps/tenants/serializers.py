from rest_framework import serializers
from apps.tenants.models import School, SubscriptionPlan, SchoolSubscription, PlatformPayment

class SchoolSerializer(serializers.ModelSerializer):
    is_trial_expired = serializers.BooleanField(read_only=True)
    has_active_subscription = serializers.BooleanField(read_only=True)
    is_read_only = serializers.BooleanField(read_only=True)

    class Meta:
        model = School
        fields = [
            'id', 'name', 'slug', 'edu_system', 'status', 'trial_ends_at',
            'city', 'phone', 'email', 'director_name', 'logo_url',
            'is_trial_expired', 'has_active_subscription', 'is_read_only',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'trial_ends_at', 'created_at', 'updated_at']


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'code', 'price_xaf', 'max_students', 'features_description', 'is_active']


class SchoolSubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)

    class Meta:
        model = SchoolSubscription
        fields = ['id', 'school', 'plan', 'plan_name', 'status', 'starts_at', 'ends_at', 'created_at']


class PlatformPaymentSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)

    class Meta:
        model = PlatformPayment
        fields = [
            'id', 'school', 'school_name', 'plan', 'plan_name', 'amount',
            'currency', 'status', 'transaction_ref', 'cinetpay_token',
            'payment_method', 'paid_at', 'created_at'
        ]
