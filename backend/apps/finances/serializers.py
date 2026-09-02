from rest_framework import serializers
from apps.finances.models import FeeCategory, FeeStructure, StudentBalance, Payment

class FeeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeCategory
        fields = ['id', 'name', 'description']


class FeeStructureSerializer(serializers.ModelSerializer):
    fee_category_name = serializers.CharField(source='fee_category.name', read_only=True)
    level_name = serializers.CharField(source='level.name', read_only=True)
    class_name = serializers.CharField(source='class_room.name', read_only=True)

    class Meta:
        model = FeeStructure
        fields = [
            'id', 'academic_year', 'level', 'level_name', 'class_room',
            'class_name', 'fee_category', 'fee_category_name', 'amount', 'due_date'
        ]


class StudentBalanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_matricule = serializers.CharField(source='student.matricule', read_only=True)
    class_name = serializers.CharField(source='student.class_room.name', read_only=True)

    class Meta:
        model = StudentBalance
        fields = [
            'id', 'student', 'student_name', 'student_matricule', 'class_name',
            'total_due', 'total_paid', 'balance_remaining', 'last_updated'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.last_name} {obj.student.first_name}".strip()


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'fee_structure', 'amount',
            'payment_method', 'status', 'transaction_ref', 'cinetpay_token',
            'receipt_number', 'receipt_url', 'paid_at', 'created_at'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.last_name} {obj.student.first_name}".strip()


class InitiatePaymentSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    fee_structure_id = serializers.IntegerField(required=False, allow_null=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_method = serializers.CharField(default='CINETPAY_OM')
