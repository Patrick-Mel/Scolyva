from rest_framework import serializers
from apps.timetables.models import Room, TimeSlot, TeacherAvailability, Timetable, TimetableEntry
from apps.academics.serializers import ClassRoomSerializer, ClassSubjectSerializer
from apps.users.serializers import UserSerializer

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'
        read_only_fields = ['id', 'school']


class TimeSlotSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TimeSlot
        fields = '__all__'
        read_only_fields = ['id', 'school']


class TeacherAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherAvailability
        fields = '__all__'
        read_only_fields = ['id', 'school']


class TimetableEntrySerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_room.name', read_only=True)
    subject_name = serializers.CharField(source='class_subject.subject.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    room_name = serializers.CharField(source='room.name', read_only=True)
    room_code = serializers.CharField(source='room.code', read_only=True)
    start_time = serializers.TimeField(source='time_slot.start_time', read_only=True)
    end_time = serializers.TimeField(source='time_slot.end_time', read_only=True)

    class Meta:
        model = TimetableEntry
        fields = '__all__'
        read_only_fields = ['id', 'school']

    def get_teacher_name(self, obj):
        if obj.teacher:
            return f"{obj.teacher.first_name} {obj.teacher.last_name}".strip()
        return "Non attribué"


class TimetableSerializer(serializers.ModelSerializer):
    entries = TimetableEntrySerializer(many=True, read_only=True)

    class Meta:
        model = Timetable
        fields = '__all__'
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']
