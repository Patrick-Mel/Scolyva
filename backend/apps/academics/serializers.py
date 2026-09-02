from rest_framework import serializers
from apps.academics.models import (
    AcademicYear, Level, ClassRoom, Subject, ClassSubject,
    Sequence, Student, Grade, ReportCard
)
from apps.users.serializers import UserSerializer

class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['id', 'name', 'start_date', 'end_date', 'is_current', 'created_at']


class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'system', 'name', 'code', 'order']


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'system', 'name', 'code']


class ClassSubjectSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = ClassSubject
        fields = ['id', 'class_room', 'subject', 'subject_name', 'subject_code', 'teacher', 'teacher_name', 'coefficient']

    def get_teacher_name(self, obj):
        if obj.teacher:
            return f"{obj.teacher.first_name} {obj.teacher.last_name}".strip()
        return "Non assigné"


class ClassRoomSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = ClassRoom
        fields = ['id', 'level', 'level_name', 'academic_year', 'academic_year_name', 'name', 'main_teacher', 'student_count', 'created_at']

    def get_student_count(self, obj):
        return obj.students.count()


class SequenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sequence
        fields = ['id', 'academic_year', 'name', 'term_number', 'order', 'is_active']


class StudentSerializer(serializers.ModelSerializer):
    class_room_name = serializers.CharField(source='class_room.name', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'matricule', 'first_name', 'last_name', 'full_name', 'gender',
            'birth_date', 'birth_place', 'class_room', 'class_room_name',
            'photo_url', 'parent_user', 'father_name', 'mother_name',
            'parent_phone', 'parent_email', 'address', 'created_at'
        ]

    def get_full_name(self, obj):
        return f"{obj.last_name} {obj.first_name}".strip()


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='class_subject.subject.name', read_only=True)
    coefficient = serializers.FloatField(source='class_subject.coefficient', read_only=True)

    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'student_name', 'class_subject', 'subject_name',
            'coefficient', 'sequence', 'score', 'max_score', 'remarks', 'created_at'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.last_name} {obj.student.first_name}".strip()


class ReportCardSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_matricule = serializers.CharField(source='student.matricule', read_only=True)
    class_name = serializers.CharField(source='class_room.name', read_only=True)
    sequence_name = serializers.CharField(source='sequence.name', read_only=True)

    class Meta:
        model = ReportCard
        fields = [
            'id', 'student', 'student_name', 'student_matricule', 'class_room',
            'class_name', 'sequence', 'sequence_name', 'total_weighted_score',
            'total_coefficients', 'overall_average', 'class_rank',
            'total_students_in_class', 'appreciation', 'pdf_url', 'generated_at'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.last_name} {obj.student.first_name}".strip()
