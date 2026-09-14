from rest_framework import serializers
from apps.exams.models import Exam, ExamQuestion, ExamSubmission, ExamAnswer, ExamIntegrityLog

class ExamQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamQuestion
        fields = '__all__'
        read_only_fields = ['id', 'school']


class ExamSerializer(serializers.ModelSerializer):
    questions = ExamQuestionSerializer(many=True, read_only=True)
    class_name = serializers.CharField(source='class_room.name', read_only=True)
    subject_name = serializers.CharField(source='class_subject.subject.name', read_only=True)

    class Meta:
        model = Exam
        fields = '__all__'
        read_only_fields = ['id', 'school', 'created_by', 'created_at']


class ExamAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    question_points = serializers.FloatField(source='question.points', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)

    class Meta:
        model = ExamAnswer
        fields = '__all__'
        read_only_fields = ['id', 'school', 'submission']


class ExamIntegrityLogSerializer(serializers.ModelSerializer):
    event_label = serializers.CharField(source='get_event_type_display', read_only=True)

    class Meta:
        model = ExamIntegrityLog
        fields = '__all__'
        read_only_fields = ['id', 'school', 'submission', 'timestamp']


class ExamSubmissionSerializer(serializers.ModelSerializer):
    answers = ExamAnswerSerializer(many=True, read_only=True)
    integrity_logs = ExamIntegrityLogSerializer(many=True, read_only=True)
    student_name = serializers.SerializerMethodField()
    student_matricule = serializers.CharField(source='student.matricule', read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    exam_duration = serializers.IntegerField(source='exam.duration_minutes', read_only=True)

    class Meta:
        model = ExamSubmission
        fields = '__all__'
        read_only_fields = ['id', 'school', 'student', 'start_time', 'integrity_score']

    def get_student_name(self, obj):
        if obj.student:
            return f"{obj.student.first_name} {obj.student.last_name}".strip()
        return "Élève"
