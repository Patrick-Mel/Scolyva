from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.timetables.models import Room, TimeSlot, TeacherAvailability, Timetable, TimetableEntry
from apps.timetables.serializers import (
    RoomSerializer, TimeSlotSerializer, TeacherAvailabilitySerializer,
    TimetableSerializer, TimetableEntrySerializer
)
from apps.timetables.solver import TimetableSolver
from apps.academics.models import AcademicYear

class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if school:
            return Room.objects.filter(school=school)
        return Room.objects.none()

    def perform_create(self, serializer):
        serializer.save(school=self.request.school)


class TimeSlotViewSet(viewsets.ModelViewSet):
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if school:
            return TimeSlot.objects.filter(school=school)
        return TimeSlot.objects.none()

    def perform_create(self, serializer):
        serializer.save(school=self.request.school)


class TimetableViewSet(viewsets.ModelViewSet):
    serializer_class = TimetableSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if school:
            return Timetable.objects.filter(school=school)
        return Timetable.objects.none()

    def perform_create(self, serializer):
        serializer.save(school=self.request.school)

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_timetable(self, request):
        """
        AI CSP Solver Endpoint: Generates conflict-free timetable for the school.
        """
        school = getattr(request, 'school', None)
        if not school:
            return Response({'error': 'École non identifiée'}, status=status.HTTP_400_BAD_REQUEST)

        academic_year_id = request.data.get('academic_year')
        timetable_name = request.data.get('name', 'Emploi du Temps Officiel')

        academic_year = None
        if academic_year_id:
            academic_year = AcademicYear.objects.filter(id=academic_year_id, school=school).first()

        if not academic_year:
            academic_year = AcademicYear.objects.filter(school=school, is_current=True).first()

        if not academic_year:
            # Fallback to any academic year
            academic_year = AcademicYear.objects.filter(school=school).first()

        solver = TimetableSolver(school=school, academic_year=academic_year, timetable_name=timetable_name)
        timetable, count = solver.generate()

        serializer = self.get_serializer(timetable)
        return Response({
            'message': f'Emploi du temps généré avec succès avec {count} créneaux assignés.',
            'entry_count': count,
            'timetable': serializer.data
        }, status=status.HTTP_201_CREATED)


class TimetableEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimetableEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if not school:
            return TimetableEntry.objects.none()

        qs = TimetableEntry.objects.filter(school=school)
        class_room_id = self.request.query_params.get('class_room')
        teacher_id = self.request.query_params.get('teacher')
        timetable_id = self.request.query_params.get('timetable')

        if class_room_id:
            qs = qs.filter(class_room_id=class_room_id)
        if teacher_id:
            qs = qs.filter(teacher_id=teacher_id)
        if timetable_id:
            qs = qs.filter(timetable_id=timetable_id)

        return qs

    def perform_create(self, serializer):
        serializer.save(school=self.request.school)

    @action(detail=False, methods=['post'], url_path='check-conflict')
    def check_conflict(self, request):
        school = getattr(request, 'school', None)
        teacher_id = request.data.get('teacher_id')
        class_room_id = request.data.get('class_room_id')
        time_slot_id = request.data.get('time_slot_id')
        exclude_entry_id = request.data.get('exclude_entry_id')

        conflicts = []

        if teacher_id and time_slot_id:
            teacher_conflict = TimetableEntry.objects.filter(
                school=school, teacher_id=teacher_id, time_slot_id=time_slot_id
            )
            if exclude_entry_id:
                teacher_conflict = teacher_conflict.exclude(id=exclude_entry_id)
            if teacher_conflict.exists():
                conflicts.append("Le professeur est déjà programmé dans un autre cours sur ce créneau.")

        if class_room_id and time_slot_id:
            class_conflict = TimetableEntry.objects.filter(
                school=school, class_room_id=class_room_id, time_slot_id=time_slot_id
            )
            if exclude_entry_id:
                class_conflict = class_conflict.exclude(id=exclude_entry_id)
            if class_conflict.exists():
                conflicts.append("Cette classe a déjà un cours programmé sur ce créneau.")

        return Response({'has_conflict': len(conflicts) > 0, 'conflicts': conflicts})
