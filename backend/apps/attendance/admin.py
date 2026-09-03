from django.contrib import admin
from .models import AttendanceRecord, Absence

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('class_room', 'school', 'date', 'taken_by', 'created_at')
    list_filter = ('date', 'class_room', 'school')

@admin.register(Absence)
class AbsenceAdmin(admin.ModelAdmin):
    list_display = ('student', 'attendance_record', 'status', 'reason', 'parent_notified')
    list_filter = ('status', 'parent_notified')
