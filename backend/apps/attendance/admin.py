from django.contrib import admin
from .models import AttendanceSession, AttendanceRecord

@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ('class_room', 'school', 'date', 'taken_by', 'created_at')
    list_filter = ('date', 'class_room', 'school')

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'is_present', 'parent_notified_sms')
    list_filter = ('is_present', 'parent_notified_sms')
