from django.db import models
from apps.tenants.abstracts import TenantModel
from apps.academics.models import AcademicYear, ClassRoom, ClassSubject
from apps.users.models import User
import uuid

class Room(TenantModel):
    ROOM_TYPE_CHOICES = (
        ('CLASSROOM', 'Salle de classe ordinaire'),
        ('LAB', 'Laboratoire de Sciences'),
        ('COMPUTER_LAB', 'Salle Informatique'),
        ('SPORTS', 'Terrain EPS / Sport'),
        ('HALL', 'Grande Salle / Amphithéâtre'),
    )

    name = models.CharField('Nom de la salle', max_length=100) # e.g. "Salle 101", "Labo Chimie"
    code = models.CharField('Code salle', max_length=50) # e.g. "S101", "LAB-CHEM"
    capacity = models.PositiveIntegerField('Capacité (élèves)', default=50)
    room_type = models.CharField('Type de salle', max_length=30, choices=ROOM_TYPE_CHOICES, default='CLASSROOM')

    class Meta:
        ordering = ['name']
        unique_together = ('school', 'code')

    def __str__(self):
        sch = self.school.name if self.school else 'Global'
        return f"{self.name} [{self.code}] ({self.capacity} places) - {sch}"


class TimeSlot(TenantModel):
    DAY_CHOICES = (
        (0, 'Lundi / Monday'),
        (1, 'Mardi / Tuesday'),
        (2, 'Mercredi / Wednesday'),
        (3, 'Jeudi / Thursday'),
        (4, 'Vendredi / Friday'),
        (5, 'Samedi / Saturday'),
    )

    day_of_week = models.IntegerField('Jour de la semaine', choices=DAY_CHOICES, default=0)
    start_time = models.TimeField('Heure de début') # e.g. 07:30
    end_time = models.TimeField('Heure de fin') # e.g. 08:30
    is_break = models.BooleanField('Pause / Récréation', default=False)
    slot_order = models.PositiveIntegerField('Ordre du créneau', default=1)

    class Meta:
        ordering = ['day_of_week', 'slot_order', 'start_time']
        unique_together = ('school', 'day_of_week', 'start_time', 'end_time')

    def __str__(self):
        day_str = dict(self.DAY_CHOICES).get(self.day_of_week, 'Jour')
        return f"{day_str}: {self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"


class TeacherAvailability(TenantModel):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.IntegerField(choices=TimeSlot.DAY_CHOICES)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='teacher_availabilities', null=True, blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('school', 'teacher', 'day_of_week', 'time_slot')

    def __str__(self):
        t_name = f"{self.teacher.first_name} {self.teacher.last_name}" if self.teacher else "Professeur"
        day_str = dict(TimeSlot.DAY_CHOICES).get(self.day_of_week, '')
        st = "Disponible" if self.is_available else "Indisponible"
        return f"{t_name} - {day_str}: {st}"


class Timetable(TenantModel):
    STATUS_CHOICES = (
        ('DRAFT', 'Brouillon en cours'),
        ('ACTIVE', 'Emploi du temps officiel actif'),
        ('ARCHIVED', 'Archivé'),
    )

    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='timetables')
    name = models.CharField('Nom de l\'emploi du temps', max_length=150) # e.g. "Emploi du temps Trimestre 1"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        yr = self.academic_year.name if self.academic_year else ''
        return f"{self.name} ({yr}) [{self.status}]"


class TimetableEntry(TenantModel):
    timetable = models.ForeignKey(Timetable, on_delete=models.CASCADE, related_name='entries')
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='timetable_entries')
    class_subject = models.ForeignKey(ClassSubject, on_delete=models.CASCADE, related_name='timetable_entries')
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='timetable_classes')
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='timetable_entries')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='entries')
    day_of_week = models.IntegerField(choices=TimeSlot.DAY_CHOICES, default=0)

    class Meta:
        ordering = ['day_of_week', 'time_slot__start_time']
        unique_together = ('timetable', 'class_room', 'time_slot')

    def __str__(self):
        cls = self.class_room.name if self.class_room else 'Classe'
        subj = self.class_subject.subject.name if (self.class_subject and self.class_subject.subject) else 'Matière'
        t_name = f"{self.teacher.last_name}" if self.teacher else 'Prof'
        rm = self.room.code if self.room else 'Salle'
        ts = str(self.time_slot) if self.time_slot else ''
        return f"{cls} - {subj} ({t_name}) à {rm} [{ts}]"
