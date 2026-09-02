from django.db import models
from apps.tenants.abstracts import TenantModel
from apps.users.models import User
import uuid

class AcademicYear(TenantModel):
    name = models.CharField(max_length=50) # e.g. "2025-2026"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.name} ({self.school.name})"


class Level(TenantModel):
    SYSTEM_CHOICES = (
        ('FRANCOPHONE', 'Système Francophone'),
        ('ANGLOPHONE', 'Anglophone System'),
    )
    system = models.CharField(max_length=20, choices=SYSTEM_CHOICES, default='FRANCOPHONE')
    name = models.CharField(max_length=100) # e.g., "6ème", "Form 1", "Terminale C"
    code = models.CharField(max_length=50) # e.g., "6EME", "F1", "TLE_C"
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['system', 'order']

    def __str__(self):
        return f"{self.name} [{self.system}]"


class ClassRoom(TenantModel):
    level = models.ForeignKey(Level, on_delete=models.PROTECT, related_name='classrooms')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='classrooms')
    name = models.CharField(max_length=100) # e.g., "6ème A", "Form 1 Arts"
    main_teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_classes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['level__order', 'name']

    def __str__(self):
        return f"{self.name} ({self.academic_year.name})"


class Subject(TenantModel):
    system = models.CharField(max_length=20, choices=Level.SYSTEM_CHOICES, default='FRANCOPHONE')
    name = models.CharField(max_length=150) # e.g. "Mathématiques", "English Language", "Physique-Chimie"
    code = models.CharField(max_length=50)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class ClassSubject(TenantModel):
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='subjects')
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT, related_name='class_assignments')
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_subjects')
    coefficient = models.FloatField(default=2.0) # Coefficient / Weight

    class Meta:
        unique_together = ('class_room', 'subject')

    def __str__(self):
        return f"{self.subject.name} - {self.class_room.name} (Coef: {self.coefficient})"


class Sequence(TenantModel):
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='sequences')
    name = models.CharField(max_length=50) # e.g., "Séquence 1", "Séquence 2", "Term 1 Exam"
    term_number = models.PositiveIntegerField(default=1) # Trimestre 1, 2, 3
    order = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.name} - {self.academic_year.name}"


class Student(TenantModel):
    GENDER_CHOICES = (
        ('M', 'Masculin / Male'),
        ('F', 'Féminin / Female'),
    )
    
    matricule = models.CharField(max_length=50, db_index=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    birth_date = models.DateField(null=True, blank=True)
    birth_place = models.CharField(max_length=150, blank=True, default='')
    class_room = models.ForeignKey(ClassRoom, on_delete=models.PROTECT, related_name='students')
    photo_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Parent details
    parent_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    father_name = models.CharField(max_length=150, blank=True, default='')
    mother_name = models.CharField(max_length=150, blank=True, default='')
    parent_phone = models.CharField(max_length=50, blank=True, default='')
    parent_email = models.EmailField(blank=True, default='')
    address = models.TextField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'matricule')
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.matricule} - {self.last_name} {self.first_name} ({self.class_room.name})"


class Grade(TenantModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    class_subject = models.ForeignKey(ClassSubject, on_delete=models.CASCADE, related_name='grades')
    sequence = models.ForeignKey(Sequence, on_delete=models.CASCADE, related_name='grades')
    score = models.FloatField() # Score out of max_score (e.g. 15.5 out of 20)
    max_score = models.FloatField(default=20.0)
    remarks = models.CharField(max_length=255, blank=True, default='')
    entered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'class_subject', 'sequence')

    def __str__(self):
        return f"{self.student.last_name} - {self.class_subject.subject.name} - {self.sequence.name}: {self.score}/{self.max_score}"


class ReportCard(TenantModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='report_cards')
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE)
    sequence = models.ForeignKey(Sequence, on_delete=models.CASCADE)
    total_weighted_score = models.FloatField()
    total_coefficients = models.FloatField()
    overall_average = models.FloatField() # out of 20
    class_rank = models.PositiveIntegerField()
    total_students_in_class = models.PositiveIntegerField()
    appreciation = models.CharField(max_length=255, blank=True, default='')
    pdf_url = models.URLField(max_length=500, blank=True, null=True)
    generated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'sequence')

    def __str__(self):
        return f"Bulletin {self.student.last_name} {self.student.first_name} - {self.sequence.name} (Moy: {self.overall_average:.2f}/20, Rang: {self.class_rank}/{self.total_students_in_class})"
