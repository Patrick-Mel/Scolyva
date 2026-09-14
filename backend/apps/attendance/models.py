from django.db import models
from apps.tenants.abstracts import TenantModel
from apps.academics.models import Student, ClassRoom, ClassSubject
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
        cls = self.class_room.name if self.class_room else "Classe"
        return f"Appel {cls} du {self.date}"


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
        st = f"{self.student.last_name} {self.student.first_name}" if self.student else "Élève"
        dt = self.attendance_record.date if self.attendance_record else ""
        return f"{st} - {self.get_status_display()} ({dt})"


class AttendanceScan(TenantModel):
    SCAN_STATUS_CHOICES = (
        ('PRESENT', 'Présent à l\'heure'),
        ('LATE', 'En Retard (scan > 10 min)'),
        ('ABSENT', 'Absent (Non scanné)'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='qr_scans')
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='qr_scans')
    class_subject = models.ForeignKey(ClassSubject, on_delete=models.SET_NULL, null=True, blank=True, related_name='qr_scans')
    scanned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    scan_timestamp = models.DateTimeField('Horodatage du scan', auto_now_add=True)
    status = models.CharField(max_length=20, choices=SCAN_STATUS_CHOICES, default='PRESENT')
    minutes_late = models.PositiveIntegerField(default=0)
    parent_notified = models.BooleanField(default=False)

    class Meta:
        ordering = ['-scan_timestamp']

    def __str__(self):
        st = f"{self.student.last_name} {self.student.first_name}" if self.student else "Élève"
        ts = self.scan_timestamp.strftime('%H:%M:%S') if self.scan_timestamp else ""
        return f"Scan QR {st}: {self.get_status_display()} à {ts}"
