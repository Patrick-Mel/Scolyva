from django.db import models
from apps.tenants.abstracts import TenantModel
from apps.academics.models import Student, ClassRoom, Level, AcademicYear
import uuid

class FeeCategory(TenantModel):
    name = models.CharField(max_length=100) # e.g. "Scolarité - Tranche 1", "Frais APE", "Inscription"
    description = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.school.name})"


class FeeStructure(TenantModel):
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='fee_structures')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='fee_structures', null=True, blank=True)
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='fee_structures', null=True, blank=True)
    fee_category = models.ForeignKey(FeeCategory, on_delete=models.PROTECT, related_name='fee_structures')
    amount = models.DecimalField(max_digits=12, decimal_places=2) # e.g. 50000.00 FCFA
    due_date = models.DateField()

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        target = self.class_room.name if self.class_room else (self.level.name if self.level else "Toutes classes")
        return f"{self.fee_category.name} - {target}: {self.amount:,.0f} FCFA"


class StudentBalance(TenantModel):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='balance')
    total_due = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    balance_remaining = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Solde {self.student.last_name} {self.student.first_name}: Dû={self.total_due:,.0f}, Payé={self.total_paid:,.0f}, Reste={self.balance_remaining:,.0f} FCFA"

    def recalculate(self):
        # Calculate sum of fee structures applicable to student's class or level
        school = self.school
        student_class = self.student.class_room
        student_level = student_class.level

        applicable_fees = FeeStructure.objects.filter(
            school=school,
            academic_year=student_class.academic_year
        ).filter(
            models.Q(class_room=student_class) |
            models.Q(level=student_level) |
            models.Q(class_room__isnull=True, level__isnull=True)
        )

        total_due = sum(f.amount for f in applicable_fees)
        
        # Calculate total payments completed
        completed_payments = Payment.objects.filter(
            school=school,
            student=self.student,
            status='COMPLETED'
        )
        total_paid = sum(p.amount for p in completed_payments)

        self.total_due = total_due
        self.total_paid = total_paid
        self.balance_remaining = max(0, total_due - total_paid)
        self.save()


class PaymentMethodChoices(models.TextChoices):
    CINETPAY_OM = 'CINETPAY_OM', 'Orange Money (CinetPay)'
    CINETPAY_MOMO = 'CINETPAY_MOMO', 'MTN Mobile Money (CinetPay)'
    CINETPAY_CARD = 'CINETPAY_CARD', 'Carte Bancaire (CinetPay)'
    CASH = 'CASH', 'Espèces (Guichet École)'
    BANK_TRANSFER = 'BANK_TRANSFER', 'Virement / Chèque Bancaire'


class PaymentStatusChoices(models.TextChoices):
    PENDING = 'PENDING', 'En attente'
    COMPLETED = 'COMPLETED', 'Validé / Payé'
    FAILED = 'FAILED', 'Échoué / Annulé'


class Payment(TenantModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PaymentMethodChoices.choices, default=PaymentMethodChoices.CINETPAY_OM)
    status = models.CharField(max_length=20, choices=PaymentStatusChoices.choices, default=PaymentStatusChoices.PENDING)
    transaction_ref = models.CharField(max_length=100, unique=True, db_index=True)
    cinetpay_token = models.CharField(max_length=255, blank=True, null=True)
    receipt_number = models.CharField(max_length=100, blank=True, default='')
    receipt_url = models.URLField(max_length=500, blank=True, null=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Reçu {self.receipt_number or self.transaction_ref} - {self.student.last_name}: {self.amount:,.0f} FCFA [{self.status}]"
