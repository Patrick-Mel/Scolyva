from django.db import models
from apps.tenants.abstracts import TenantModel
from apps.academics.models import Student, ClassRoom
from apps.users.models import User

class AttendanceRecord(TenantModel):
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    taken_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('class_room', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"Appel {self.class_room.name} du {self.date}"


class Absence(TenantModel):
    STATUS_CHOICES = (
        ('ABSENT', 'Absent Non Justifié'),
        ('LATE', 'En Retard'),
        ('EXCUSED', 'Absent Justifié'),
    )

    attendance_record = models.ForeignKey(AttendanceRecord, on_delete=models.CASCADE, related_name='absences')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='absences')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ABSENT')
    reason = models.CharField(max_length=255, blank=True, default='')
    parent_notified = models.BooleanField(default=False)

    class Meta:
        unique_together = ('attendance_record', 'student')

    def __str__(self):
        return f"{self.student.last_name} {self.student.first_name} - {self.get_status_display()} ({self.attendance_record.date})"
