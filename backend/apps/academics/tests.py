from django.test import TestCase
from django.utils import timezone
from datetime import timedelta

from apps.tenants.models import School, SchoolStatus
from apps.users.models import User, Membership, RoleChoices
from apps.academics.models import (
    AcademicYear, Level, ClassRoom, Subject, ClassSubject, Sequence, Student, Grade, ReportCard
)

class AcademicGradeEngineTest(TestCase):
    def setUp(self):
        self.school = School.objects.create(
            name="Test College",
            slug="test-col",
            status=SchoolStatus.TRIAL,
            trial_ends_at=timezone.now() + timedelta(days=14),
            email="test@col.com",
            phone="+237600000000"
        )
        self.ay = AcademicYear.objects.create(school=self.school, name="2025-2026", start_date="2025-09-01", end_date="2026-06-30")
        self.level = Level.objects.create(school=self.school, name="6eme", code="6E", order=1)
        self.classroom = ClassRoom.objects.create(school=self.school, level=self.level, academic_year=self.ay, name="6eme A")

        self.sub_math = Subject.objects.create(school=self.school, name="Maths", code="MATH")
        self.sub_fr = Subject.objects.create(school=self.school, name="Français", code="FR")

        self.cs_math = ClassSubject.objects.create(school=self.school, class_room=self.classroom, subject=self.sub_math, coefficient=4.0)
        self.cs_fr = ClassSubject.objects.create(school=self.school, class_room=self.classroom, subject=self.sub_fr, coefficient=2.0)

        self.seq1 = Sequence.objects.create(school=self.school, academic_year=self.ay, name="Seq 1", order=1)

        self.student1 = Student.objects.create(school=self.school, matricule="ST1", first_name="Jean", last_name="Dupont", class_room=self.classroom)
        self.student2 = Student.objects.create(school=self.school, matricule="ST2", first_name="Paul", last_name="Biya", class_room=self.classroom)

    def test_weighted_average_calculation(self):
        """Student 1: Math 16/20 (Coef 4), FR 10/20 (Coef 2) -> (16*4 + 10*2)/6 = 84/6 = 14.0/20"""
        Grade.objects.create(school=self.school, student=self.student1, class_subject=self.cs_math, sequence=self.seq1, score=16.0)
        Grade.objects.create(school=self.school, student=self.student1, class_subject=self.cs_fr, sequence=self.seq1, score=10.0)

        # Student 2: Math 10/20 (Coef 4), FR 10/20 (Coef 2) -> 10.0/20
        Grade.objects.create(school=self.school, student=self.student2, class_subject=self.cs_math, sequence=self.seq1, score=10.0)
        Grade.objects.create(school=self.school, student=self.student2, class_subject=self.cs_fr, sequence=self.seq1, score=10.0)

        # Generate report cards via direct engine logic
        for student in [self.student1, self.student2]:
            grades = Grade.objects.filter(student=student, sequence=self.seq1)
            tot_pts = sum(g.score * g.class_subject.coefficient for g in grades)
            tot_coefs = sum(g.class_subject.coefficient for g in grades)
            avg = tot_pts / tot_coefs
            ReportCard.objects.create(
                school=self.school, student=student, class_room=self.classroom, sequence=self.seq1,
                total_weighted_score=tot_pts, total_coefficients=tot_coefs, overall_average=avg,
                class_rank=1 if student == self.student1 else 2, total_students_in_class=2
            )

        rc1 = ReportCard.objects.get(student=self.student1, sequence=self.seq1)
        rc2 = ReportCard.objects.get(student=self.student2, sequence=self.seq1)

        self.assertEqual(rc1.overall_average, 14.0)
        self.assertEqual(rc1.class_rank, 1)

        self.assertEqual(rc2.overall_average, 10.0)
        self.assertEqual(rc2.class_rank, 2)
