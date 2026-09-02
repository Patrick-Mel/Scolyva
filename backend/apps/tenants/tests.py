from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status

from apps.tenants.models import School, SchoolStatus, SubscriptionPlan
from apps.users.models import User, Membership, RoleChoices
from apps.academics.models import Student, AcademicYear, Level, ClassRoom

class MultiTenantIsolationTest(TestCase):
    def setUp(self):
        # Create School A
        self.school_a = School.objects.create(
            name="College Alpha",
            slug="alpha",
            status=SchoolStatus.TRIAL,
            trial_ends_at=timezone.now() + timedelta(days=14),
            email="alpha@test.com",
            phone="+237600000001"
        )
        self.user_a = User.objects.create_user(email="admin@alpha.com", password="password123")
        Membership.objects.create(user=self.user_a, school=self.school_a, role=RoleChoices.SCHOOL_ADMIN)

        ay_a = AcademicYear.objects.create(school=self.school_a, name="2025-2026", start_date="2025-09-01", end_date="2026-06-30")
        lvl_a = Level.objects.create(school=self.school_a, name="6eme", code="6E", order=1)
        cls_a = ClassRoom.objects.create(school=self.school_a, level=lvl_a, academic_year=ay_a, name="6eme A")
        self.student_a = Student.objects.create(
            school=self.school_a, matricule="ALPHA-001", first_name="Elève", last_name="Alpha", class_room=cls_a
        )

        # Create School B
        self.school_b = School.objects.create(
            name="College Beta",
            slug="beta",
            status=SchoolStatus.TRIAL,
            trial_ends_at=timezone.now() + timedelta(days=14),
            email="beta@test.com",
            phone="+237600000002"
        )
        self.user_b = User.objects.create_user(email="admin@beta.com", password="password123")
        Membership.objects.create(user=self.user_b, school=self.school_b, role=RoleChoices.SCHOOL_ADMIN)

        ay_b = AcademicYear.objects.create(school=self.school_b, name="2025-2026", start_date="2025-09-01", end_date="2026-06-30")
        lvl_b = Level.objects.create(school=self.school_b, name="Form 1", code="F1", order=1)
        cls_b = ClassRoom.objects.create(school=self.school_b, level=lvl_b, academic_year=ay_b, name="Form 1A")
        self.student_b = Student.objects.create(
            school=self.school_b, matricule="BETA-001", first_name="Elève", last_name="Beta", class_room=cls_b
        )

        self.client = APIClient()

    def test_multi_tenant_isolation(self):
        """User from School A cannot access School B data."""
        self.client.force_authenticate(user=self.user_a)
        
        # Request with School A header
        response = self.client.get('/api/v1/academics/students/', HTTP_X_SCHOOL_ID=str(self.school_a.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Results must only contain School A students
        matricules = [s['matricule'] for s in response.data['results']]
        self.assertIn("ALPHA-001", matricules)
        self.assertNotIn("BETA-001", matricules)

    def test_trial_expiry_readonly_enforcement(self):
        """Expired trial without active subscription blocks write operations but allows read operations."""
        # Expire School A trial
        self.school_a.trial_ends_at = timezone.now() - timedelta(days=1)
        self.school_a.status = SchoolStatus.READ_ONLY
        self.school_a.save()

        self.client.force_authenticate(user=self.user_a)

        # GET request should succeed (Read-Only access)
        get_response = self.client.get('/api/v1/academics/students/', HTTP_X_SCHOOL_ID=str(self.school_a.id))
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)

        # POST (write operation) should be blocked with HTTP 403 / 402 PermissionDenied
        post_response = self.client.post(
            '/api/v1/academics/students/',
            {
                'matricule': 'ALPHA-002',
                'first_name': 'New',
                'last_name': 'Student',
                'class_room': str(self.student_a.class_room.id)
            },
            HTTP_X_SCHOOL_ID=str(self.school_a.id)
        )
        self.assertIn(post_response.status_code, [status.HTTP_402_PAYMENT_REQUIRED, status.HTTP_403_FORBIDDEN])
