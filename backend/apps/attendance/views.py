from rest_framework import serializers, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from datetime import datetime, time

from apps.attendance.models import AttendanceRecord, Absence, AttendanceScan
from apps.attendance.qr_signer import generate_student_qr_token, verify_student_qr_token
from apps.academics.models import Student, ClassRoom
from apps.notifications.models import Notification
from apps.tenants.permissions import IsSchoolActiveOrReadOnly, IsTeacher

class AbsenceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_matricule = serializers.CharField(source='student.matricule', read_only=True)

    class Meta:
        model = Absence
        fields = ['id', 'attendance_record', 'student', 'student_name', 'student_matricule', 'status', 'reason', 'parent_notified']

    def get_student_name(self, obj):
        if obj.student:
            return f"{obj.student.last_name} {obj.student.first_name}".strip()
        return "Élève"


class AttendanceRecordSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_room.name', read_only=True)
    absences = AbsenceSerializer(many=True, read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'class_room', 'class_name', 'date', 'taken_by', 'absences', 'created_at']


class AttendanceScanSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_matricule = serializers.CharField(source='student.matricule', read_only=True)
    class_name = serializers.CharField(source='class_room.name', read_only=True)

    class Meta:
        model = AttendanceScan
        fields = '__all__'
        read_only_fields = ['id', 'school', 'scanned_by', 'scan_timestamp']

    def get_student_name(self, obj):
        if obj.student:
            return f"{obj.student.first_name} {obj.student.last_name}".strip()
        return "Élève"


class AttendanceScanViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceScanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if not school:
            return AttendanceScan.objects.none()

        qs = AttendanceScan.objects.filter(school=school)
        class_room_id = self.request.query_params.get('class_room')
        student_id = self.request.query_params.get('student')

        if class_room_id:
            qs = qs.filter(class_room_id=class_room_id)
        if student_id:
            qs = qs.filter(student_id=student_id)

        return qs

    @action(detail=False, methods=['post'], url_path='scan-qr')
    def scan_qr(self, request):
        school = getattr(request, 'school', None)
        qr_token = request.data.get('qr_token')
        class_room_id = request.data.get('class_room_id')

        if not qr_token:
            return Response({'error': 'Jeton QR requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = verify_student_qr_token(qr_token)
        except ValueError as err:
            return Response({'error': str(err)}, status=status.HTTP_400_BAD_REQUEST)

        student_id = payload.get('student_id')
        student = Student.objects.filter(id=student_id, school=school).first()
        if not student:
            return Response({'error': 'Élève non trouvé dans cet établissement'}, status=status.HTTP_404_NOT_FOUND)

        class_room = None
        if class_room_id:
            class_room = ClassRoom.objects.filter(id=class_room_id, school=school).first()
        if not class_room:
            class_room = student.class_room

        # Grace Period Logic
        now = timezone.now()
        current_time = now.time()
        # Default start time for class (e.g. 08:00 AM)
        class_start_time = time(8, 0)
        
        minutes_late = 0
        scan_status = 'PRESENT'

        if current_time > time(8, 10):
            scan_status = 'LATE'
            minutes_late = int((datetime.combine(now.date(), current_time) - datetime.combine(now.date(), class_start_time)).total_seconds() / 60)

        scan, created = AttendanceScan.objects.get_or_create(
            school=school,
            student=student,
            class_room=class_room,
            scan_timestamp__date=now.date(),
            defaults={
                'scanned_by': request.user,
                'status': scan_status,
                'minutes_late': minutes_late,
                'parent_notified': True
            }
        )

        # Notify Parent if Late or Absent
        if student.parent_user and scan_status == 'LATE':
            Notification.objects.create(
                school=school,
                recipient=student.parent_user,
                title=f"Alerte Retard : {student.first_name} {student.last_name}",
                message=f"Votre enfant {student.first_name} est arrivé en retard de {minutes_late} minutes le {now.strftime('%d/%m/%Y à %H:%M')}.",
                channel='IN_APP'
            )

        serializer = self.get_serializer(scan)
        return Response({
            'message': f"Scan réussi: {student.first_name} {student.last_name} ({scan_status})",
            'status': scan_status,
            'minutes_late': minutes_late,
            'scan': serializer.data
        }, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='student-token')
    def get_student_token(self, request):
        school = getattr(request, 'school', None)
        student_id = request.query_params.get('student_id')

        student = None
        if student_id:
            student = Student.objects.filter(id=student_id, school=school).first()
        
        if not student:
            student = Student.objects.filter(school=school).first()

        if not student:
            return Response({'error': 'Aucun élève trouvé'}, status=status.HTTP_404_NOT_FOUND)

        token = generate_student_qr_token(student)
        return Response({
            'student_id': str(student.id),
            'matricule': student.matricule,
            'student_name': f"{student.first_name} {student.last_name}",
            'qr_token': token
        })


class BulkAttendanceEntryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher, IsSchoolActiveOrReadOnly]

    @transaction.atomic
    def post(self, request):
        class_room_id = request.data.get('class_room_id')
        date = request.data.get('date')
        absences_data = request.data.get('absences', []) # list of {student_id, status, reason}

        if not class_room_id or not date:
            return Response({'error': 'class_room_id et date sont requis.'}, status=status.HTTP_400_BAD_REQUEST)

        school = getattr(request, 'school', None)
        record, _ = AttendanceRecord.objects.get_or_create(
            school=school,
            class_room_id=class_room_id,
            date=date,
            defaults={'taken_by': request.user}
        )

        for item in absences_data:
            student_id = item.get('student_id')
            st = item.get('status', 'ABSENT')
            reason = item.get('reason', '')

            if student_id:
                Absence.objects.update_or_create(
                    school=school,
                    attendance_record=record,
                    student_id=student_id,
                    defaults={
                        'status': st,
                        'reason': reason,
                        'parent_notified': True
                    }
                )

        return Response({
            'message': 'Appel enregistré avec succès.',
            'record': AttendanceRecordSerializer(record).data
        }, status=status.HTTP_200_OK)
