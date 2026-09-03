from django.contrib import admin
from .models import FeeCategory, FeeStructure, StudentBalance, Payment

@admin.register(FeeCategory)
class FeeCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'school', 'description')
    list_filter = ('school',)

@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ('fee_category', 'school', 'level', 'academic_year', 'amount', 'due_date')
    list_filter = ('fee_category', 'academic_year', 'school')

@admin.register(StudentBalance)
class StudentBalanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'school', 'total_due', 'total_paid', 'balance_remaining')
    list_filter = ('school',)
    search_fields = ('student__first_name', 'student__last_name', 'student__matricule')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'student', 'school', 'amount', 'payment_method', 'status', 'transaction_ref', 'paid_at')
    list_filter = ('payment_method', 'status', 'school')
    search_fields = ('receipt_number', 'transaction_ref', 'student__first_name', 'student__last_name')
