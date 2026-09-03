from django.contrib import admin
from .models import School, SubscriptionPlan, SchoolSubscription

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'edu_system', 'status', 'trial_ends_at', 'city', 'phone', 'email', 'created_at')
    list_filter = ('edu_system', 'status', 'city')
    search_fields = ('name', 'slug', 'city', 'phone', 'email', 'director_name')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('-created_at',)

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'price_xaf', 'max_students', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'code')

@admin.register(SchoolSubscription)
class SchoolSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('school', 'plan', 'starts_at', 'ends_at')
    list_filter = ('plan',)
    search_fields = ('school__name', 'plan__name')
