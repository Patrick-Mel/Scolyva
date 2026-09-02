from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Sum, F, ExpressionWrapper, FloatField

from apps.academics.models import (
    AcademicYear, Level, ClassRoom, Subject, ClassSubject,
    Sequence, Student, Grade, ReportCard
)
from apps.academics.serializers import (
    AcademicYearSerializer, LevelSerializer, ClassRoomSerializer,
    SubjectSerializer, ClassSubjectSerializer, SequenceSerializer,
    StudentSerializer, GradeSerializer, ReportCardSerializer
)
from apps.tenants.permissions import IsSchoolActiveOrReadOnly, IsTeacher, IsSchoolAdmin

class AcademicYearViewSet(viewsets.ModelViewSet):
    serializer_class = AcademicYearSerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        return AcademicYear.objects.filter(school=school) if school else AcademicYear.objects.none()


class LevelViewSet(viewsets.ModelViewSet):
    serializer_class = LevelSerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        return Level.objects.filter(school=school) if school else Level.objects.none()


class ClassRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ClassRoomSerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        return ClassRoom.objects.filter(school=school) if school else ClassRoom.objects.none()


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        return Subject.objects.filter(school=school) if school else Subject.objects.none()


class ClassSubjectViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSubjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        queryset = ClassSubject.objects.filter(school=school) if school else ClassSubject.objects.none()
        class_room_id = self.request.query_params.get('class_room')
        if class_room_id:
            queryset = queryset.filter(class_room_id=class_room_id)
        return queryset


class SequenceViewSet(viewsets.ModelViewSet):
    serializer_class = SequenceSerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        return Sequence.objects.filter(school=school) if school else Sequence.objects.none()


class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if not school:
            return Student.objects.none()
        
        queryset = Student.objects.filter(school=school)
        class_room_id = self.request.query_params.get('class_room')
        if class_room_id:
            queryset = queryset.filter(class_room_id=class_room_id)
            
        parent_user_id = self.request.query_params.get('parent_user')
        if parent_user_id:
            queryset = queryset.filter(parent_user_id=parent_user_id)
            
        return queryset


class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolActiveOrReadOnly]

    def get_queryset(self):
        school = getattr(self.request, 'school', None)
        if not school:
            return Grade.objects.none()

        queryset = Grade.objects.filter(school=school)
        student_id = self.request.query_params.get('student')
        sequence_id = self.request.query_params.get('sequence')
        class_subject_id = self.request.query_params.get('class_subject')
        class_room_id = self.request.query_params.get('class_room')

        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if sequence_id:
            queryset = queryset.filter(sequence_id=sequence_id)
        if class_subject_id:
            queryset = queryset.filter(class_subject_id=class_subject_id)
        if class_room_id:
            queryset = queryset.filter(class_subject__class_room_id=class_room_id)

        return queryset


class BulkGradeEntryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher, IsSchoolActiveOrReadOnly]

    @transaction.atomic
    def post(self, request):
        sequence_id = request.data.get('sequence_id')
        class_subject_id = request.data.get('class_subject_id')
        grades_data = request.data.get('grades', []) # list of {student_id, score, remarks}

        if not sequence_id or not class_subject_id or not grades_data:
            return Response({'error': 'sequence_id, class_subject_id et grades sont requis.'}, status=status.HTTP_400_BAD_REQUEST)

        school = getattr(request, 'school', None)
        created_grades = []

        for item in grades_data:
            student_id = item.get('student_id')
            score = item.get('score')
            remarks = item.get('remarks', '')

            if student_id is not None and score is not None:
                grade, _ = Grade.objects.update_or_create(
                    school=school,
                    student_id=student_id,
                    class_subject_id=class_subject_id,
                    sequence_id=sequence_id,
                    defaults={
                        'score': float(score),
                        'max_score': 20.0,
                        'remarks': remarks,
                        'entered_by': request.user
                    }
                )
                created_grades.append(grade)

        return Response({
            'message': f'{len(created_grades)} notes enregistrées avec succès.',
            'count': len(created_grades)
        }, status=status.HTTP_200_OK)


class GenerateReportCardsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSchoolAdmin, IsSchoolActiveOrReadOnly]

    @transaction.atomic
    def post(self, request):
        class_room_id = request.data.get('class_room_id')
        sequence_id = request.data.get('sequence_id')

        if not class_room_id or not sequence_id:
            return Response({'error': 'class_room_id et sequence_id sont requis.'}, status=status.HTTP_400_BAD_REQUEST)

        school = getattr(request, 'school', None)
        try:
            class_room = ClassRoom.objects.get(id=class_room_id, school=school)
            sequence = Sequence.objects.get(id=sequence_id, school=school)
        except (ClassRoom.DoesNotExist, Sequence.DoesNotExist):
            return Response({'error': 'Classe ou Séquence introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        students = Student.objects.filter(class_room=class_room, school=school)
        total_students = students.count()

        if total_students == 0:
            return Response({'error': 'Aucun élève trouvé dans cette classe.'}, status=status.HTTP_400_BAD_REQUEST)

        student_averages = []

        for student in students:
            grades = Grade.objects.filter(student=student, sequence=sequence, school=school)
            total_points = 0.0
            total_coefs = 0.0

            for grade in grades:
                coef = grade.class_subject.coefficient
                normalized_score = (grade.score / grade.max_score) * 20.0
                total_points += normalized_score * coef
                total_coefs += coef

            overall_avg = (total_points / total_coefs) if total_coefs > 0 else 0.0

            student_averages.append({
                'student': student,
                'total_points': total_points,
                'total_coefs': total_coefs,
                'overall_average': round(overall_avg, 2)
            })

        # Rank students by overall_average descending
        student_averages.sort(key=lambda x: x['overall_average'], reverse=True)

        generated_report_cards = []
        for rank, item in enumerate(student_averages, start=1):
            avg = item['overall_average']
            if avg >= 16:
                appr = "Très Bien - Tableau d'Honneur"
            elif avg >= 14:
                appr = "Bien - Félicitations"
            elif avg >= 12:
                appr = "Assez Bien - Encouragements"
            elif avg >= 10:
                appr = "Passable"
            elif avg >= 8:
                appr = "Insuffisant - Doit fournir des efforts"
            else:
                appr = "Médiocre - Avertissement Travail"

            rc, _ = ReportCard.objects.update_or_create(
                school=school,
                student=item['student'],
                sequence=sequence,
                defaults={
                    'class_room': class_room,
                    'total_weighted_score': item['total_points'],
                    'total_coefficients': item['total_coefs'],
                    'overall_average': avg,
                    'class_rank': rank,
                    'total_students_in_class': total_students,
                    'appreciation': appr
                }
            )
            generated_report_cards.append(rc)

        return Response({
            'message': f'Bulletins générés pour {len(generated_report_cards)} élèves de {class_room.name}.',
            'report_cards': ReportCardSerializer(generated_report_cards, many=True).data
        }, status=status.HTTP_200_OK)
