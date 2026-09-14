from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from apps.exams.models import Exam, ExamQuestion, ExamSubmission, ExamAnswer, ExamIntegrityLog
from apps.exams.serializers import (
    ExamSerializer, ExamQuestionSerializer, ExamSubmissionSerializer,
    ExamAnswerSerializer, ExamIntegrityLogSerializer
)
from apps.academics.models import Student

class ExamViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if not school:
            return Exam.objects.none()

        qs = Exam.objects.filter(school=school)
        class_room_id = self.request.query_params.get('class_room')
        if class_room_id:
            qs = qs.filter(class_room_id=class_room_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(school=self.request.school, created_by=self.request.user)


class ExamQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = ExamQuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if not school:
            return ExamQuestion.objects.none()

        qs = ExamQuestion.objects.filter(school=school)
        exam_id = self.request.query_params.get('exam')
        if exam_id:
            qs = qs.filter(exam_id=exam_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(school=self.request.school)


class ExamSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if not school:
            return ExamSubmission.objects.none()

        qs = ExamSubmission.objects.filter(school=school)
        exam_id = self.request.query_params.get('exam')
        student_id = self.request.query_params.get('student')

        if exam_id:
            qs = qs.filter(exam_id=exam_id)
        if student_id:
            qs = qs.filter(student_id=student_id)

        return qs

    @action(detail=False, methods=['post'], url_path='start')
    def start_exam(self, request):
        school = getattr(request, 'school', None)
        exam_id = request.data.get('exam_id')
        student_id = request.data.get('student_id')

        if not exam_id:
            return Response({'error': 'Id examen requis'}, status=status.HTTP_400_BAD_REQUEST)

        exam = Exam.objects.filter(id=exam_id, school=school).first()
        if not exam:
            return Response({'error': 'Examen introuvable'}, status=status.HTTP_404_NOT_FOUND)

        student = None
        if student_id:
            student = Student.objects.filter(id=student_id, school=school).first()

        if not student:
            # Fallback for parent or student user link
            student = Student.objects.filter(school=school).first()

        submission, created = ExamSubmission.objects.get_or_create(
            school=school,
            exam=exam,
            student=student,
            defaults={'status': 'IN_PROGRESS', 'integrity_score': 100.0}
        )

        serializer = self.get_serializer(submission)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='auto-save')
    def auto_save_answers(self, request, pk=None):
        submission = self.get_object()
        answers_data = request.data.get('answers', [])

        for ans in answers_data:
            question_id = ans.get('question_id')
            answer_text = ans.get('answer_text', '')
            selected_options = ans.get('selected_options', [])
            response_time = ans.get('response_time_seconds', 0)

            if question_id:
                question = ExamQuestion.objects.filter(id=question_id, exam=submission.exam).first()
                if question:
                    ExamAnswer.objects.update_or_create(
                        school=submission.school,
                        submission=submission,
                        question=question,
                        defaults={
                            'answer_text': answer_text,
                            'selected_options': selected_options,
                            'response_time_seconds': response_time
                        }
                    )

        return Response({'status': 'Draft auto-saved successfully'})

    @action(detail=True, methods=['post'], url_path='log-integrity')
    def log_integrity(self, request, pk=None):
        submission = self.get_object()
        event_type = request.data.get('event_type', 'TAB_BLUR')
        details = request.data.get('details', {})

        # Log integrity violation
        ExamIntegrityLog.objects.create(
            school=submission.school,
            submission=submission,
            event_type=event_type,
            details=details
        )

        # Deduct integrity score
        penalty_map = {
            'TAB_BLUR': 5.0,
            'WINDOW_FOCUS_LOSS': 5.0,
            'COPY_PASTE_ATTEMPT': 10.0,
            'RIGHT_CLICK_ATTEMPT': 3.0,
            'RAPID_SUBMISSION': 15.0,
        }
        penalty = penalty_map.get(event_type, 5.0)
        submission.integrity_score = max(0.0, submission.integrity_score - penalty)
        submission.save(update_fields=['integrity_score'])

        return Response({
            'status': 'Integrity event logged',
            'current_integrity_score': submission.integrity_score
        })

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_exam(self, request, pk=None):
        submission = self.get_object()
        answers_data = request.data.get('answers', [])
        auto_submitted = request.data.get('auto_submitted', False)

        # 1. Save final answers
        for ans in answers_data:
            question_id = ans.get('question_id')
            answer_text = ans.get('answer_text', '')
            selected_options = ans.get('selected_options', [])

            if question_id:
                question = ExamQuestion.objects.filter(id=question_id, exam=submission.exam).first()
                if question:
                    ExamAnswer.objects.update_or_create(
                        school=submission.school,
                        submission=submission,
                        question=question,
                        defaults={
                            'answer_text': answer_text,
                            'selected_options': selected_options
                        }
                    )

        # 2. Auto-grade MCQ questions
        questions = ExamQuestion.objects.filter(exam=submission.exam)
        total_score = 0.0

        for q in questions:
            user_ans = ExamAnswer.objects.filter(submission=submission, question=q).first()
            if not user_ans:
                continue

            if q.question_type == 'MCQ':
                correct = q.correct_answer.strip()
                # Check selected option
                user_selected = user_ans.selected_options
                if user_selected and str(user_selected[0]).strip().lower() == correct.lower():
                    user_ans.score_granted = q.points
                    total_score += q.points
                else:
                    user_ans.score_granted = 0.0
                user_ans.save(update_fields=['score_granted'])

        submission.status = 'SUBMITTED'
        submission.submit_time = timezone.now()
        submission.auto_submitted = auto_submitted
        submission.total_score = total_score
        submission.save()

        serializer = self.get_serializer(submission)
        return Response(serializer.data, status=status.HTTP_200_OK)
