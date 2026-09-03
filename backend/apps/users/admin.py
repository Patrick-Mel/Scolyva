from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Membership

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'phone', 'is_superadmin', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_superadmin', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'phone')
    ordering = ('-date_joined',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('first_name', 'last_name', 'phone', 'avatar')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_superadmin', 'groups', 'user_permissions')}),
        ('Dates importantes', {'fields': ('last_login', 'date_joined')}),
    )

@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'school', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'school')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'school__name')
