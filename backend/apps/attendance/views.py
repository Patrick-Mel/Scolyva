from rest_framework import serializers, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction

from apps.attendance.models import AttendanceRecord, Absence
from apps.tenants.permissions import IsSchoolActiveOrReadOnly, IsTeacher

class AbsenceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_matricule = serializers.CharField(source='student.matricule', read_only=True)

    class Meta:
        model = Absence
        fields = ['id', 'attendance_record', 'student', 'student_name', 'student_matricule', 'status', 'reason', 'parent_notified']

    def get_student_name(self, obj):
        return f"{obj.student.last_name} {obj.student.first_name}".strip()


class AttendanceRecordSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_room.name', read_only=True)
    absences = AbsenceSerializer(many=True, read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'class_room', 'class_name', 'date', 'taken_by', 'absences', 'created_at']


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
