from django.contrib import admin
from .models import (
    AcademicYear, Level, ClassRoom, Subject, ClassSubject, Sequence, Student, Grade, ReportCard
)

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('name', 'school', 'start_date', 'end_date', 'is_current')
    list_filter = ('is_current', 'school')

@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'school', 'system', 'order')
    list_filter = ('system', 'school')

@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'school', 'level', 'academic_year', 'main_teacher')
    list_filter = ('academic_year', 'level', 'school')
    search_fields = ('name',)

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'school', 'system')
    list_filter = ('system', 'school')

@admin.register(ClassSubject)
class ClassSubjectAdmin(admin.ModelAdmin):
    list_display = ('subject', 'class_room', 'school', 'teacher', 'coefficient')
    list_filter = ('class_room', 'school')

@admin.register(Sequence)
class SequenceAdmin(admin.ModelAdmin):
    list_display = ('name', 'school', 'academic_year', 'term_number', 'order', 'is_active')
    list_filter = ('is_active', 'academic_year', 'school')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('matricule', 'first_name', 'last_name', 'school', 'class_room', 'gender', 'is_active')
    list_filter = ('class_room', 'gender', 'is_active', 'school')
    search_fields = ('matricule', 'first_name', 'last_name', 'parent_phone')

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'class_subject', 'sequence', 'score', 'entered_by', 'updated_at')
    list_filter = ('sequence', 'class_subject')
    search_fields = ('student__first_name', 'student__last_name', 'student__matricule')

@admin.register(ReportCard)
class ReportCardAdmin(admin.ModelAdmin):
    list_display = ('student', 'class_room', 'sequence', 'overall_average', 'class_rank', 'appreciation')
    list_filter = ('sequence', 'class_room')
