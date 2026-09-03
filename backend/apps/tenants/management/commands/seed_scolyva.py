from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from apps.tenants.models import School, SubscriptionPlan, SchoolSubscription, EducationalSystem, SchoolStatus
from apps.users.models import User, Membership, RoleChoices
from apps.academics.models import (
    AcademicYear, Level, ClassRoom, Subject, ClassSubject, Sequence, Student, Grade, ReportCard
)
from apps.finances.models import FeeCategory, FeeStructure, StudentBalance, Payment, PaymentStatusChoices, PaymentMethodChoices

class Command(BaseCommand):
    help = 'Seeds initial Scolyva platform data, default plans, superadmin, and demo schools'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- Initialisation des données Scolyva ---'))

        # 1. Default Subscription Plans
        plans_data = [
            {
                'name': 'Starter',
                'code': 'STARTER',
                'price_xaf': 150000.00,
                'max_students': 200,
                'features_description': 'Gestion des élèves, classes, notes, bulletins PDF et présences.'
            },
            {
                'name': 'Pro',
                'code': 'PRO',
                'price_xaf': 350000.00,
                'max_students': 600,
                'features_description': 'Inclut Starter + Finances complètes, reçus, espace parents et SMS.'
            },
            {
                'name': 'Business',
                'code': 'BUSINESS',
                'price_xaf': 750000.00,
                'max_students': 1500,
                'features_description': 'Inclut Pro + CinetPay Mobile Money, recouvrement auto et bilinguisme.'
            },
            {
                'name': 'Enterprise',
                'code': 'ENTERPRISE',
                'price_xaf': 1500000.00,
                'max_students': 5000,
                'features_description': 'Groupes scolaires, support dédié 24/7 et hébergement sur mesure.'
            },
        ]

        for p_data in plans_data:
            plan, created = SubscriptionPlan.objects.get_or_create(code=p_data['code'], defaults=p_data)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Plan créé: {plan.name}'))

        # 2. Super Admin User (Patrick Melaga)
        superadmin, created = User.objects.get_or_create(
            email='admin@scolyva.com',
            defaults={
                'first_name': 'Patrick',
                'last_name': 'Melaga',
                'phone': '+237690000000',
                'is_staff': True,
                'is_superuser': True,
                'is_superadmin': True
            }
        )
        if not created:
            superadmin.first_name = 'Patrick'
            superadmin.last_name = 'Melaga'
            superadmin.is_staff = True
            superadmin.is_superuser = True
            superadmin.is_superadmin = True
            superadmin.save()
        else:
            superadmin.set_password('SuperAdmin2026!')
            superadmin.save()
        self.stdout.write(self.style.SUCCESS('Super Admin mis à jour: Patrick Melaga (admin@scolyva.com)'))

        # 3. Demo School 1: Collège Excellence Douala (Francophone)
        school1, created = School.objects.get_or_create(
            slug='college-excellence',
            defaults={
                'name': 'Collège Excellence Douala',
                'edu_system': EducationalSystem.FRANCOPHONE,
                'status': SchoolStatus.TRIAL,
                'trial_ends_at': timezone.now() + timedelta(days=14),
                'city': 'Douala',
                'phone': '+237677112233',
                'email': 'contact@excellence-douala.cm',
                'director_name': 'Dr. Jean-Pierre Mbida'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'École créée: {school1.name}'))

            # School Admin User
            admin_user, _ = User.objects.get_or_create(
                email='director@excellence.cm',
                defaults={'first_name': 'Jean-Pierre', 'last_name': 'Mbida', 'phone': '+237677112233'}
            )
            admin_user.set_password('Scolyva2026!')
            admin_user.save()
            Membership.objects.create(user=admin_user, school=school1, role=RoleChoices.SCHOOL_ADMIN)

            # Accountant
            acc_user, _ = User.objects.get_or_create(
                email='comptable@excellence.cm',
                defaults={'first_name': 'Marie', 'last_name': 'Ekani', 'phone': '+237699445566'}
            )
            acc_user.set_password('Scolyva2026!')
            acc_user.save()
            Membership.objects.create(user=acc_user, school=school1, role=RoleChoices.ACCOUNTANT)

            # Teacher
            teacher_user, _ = User.objects.get_or_create(
                email='enseignant@excellence.cm',
                defaults={'first_name': 'Paul', 'last_name': 'Atangana', 'phone': '+237655889900'}
            )
            teacher_user.set_password('Scolyva2026!')
            teacher_user.save()
            Membership.objects.create(user=teacher_user, school=school1, role=RoleChoices.TEACHER)

            # Academic Year & Levels
            ay = AcademicYear.objects.create(
                school=school1, name='2025-2026', start_date='2025-09-01', end_date='2026-06-30', is_current=True
            )
            level_6e = Level.objects.create(school=school1, system='FRANCOPHONE', name='6ème', code='6EME', order=1)
            level_tle = Level.objects.create(school=school1, system='FRANCOPHONE', name='Terminale C', code='TLE_C', order=7)

            c_6eA = ClassRoom.objects.create(school=school1, level=level_6e, academic_year=ay, name='6ème A', main_teacher=teacher_user)
            c_tleC = ClassRoom.objects.create(school=school1, level=level_tle, academic_year=ay, name='Terminale C1', main_teacher=teacher_user)

            # Subjects & ClassSubjects
            sub_math = Subject.objects.create(school=school1, system='FRANCOPHONE', name='Mathématiques', code='MATH')
            sub_fr = Subject.objects.create(school=school1, system='FRANCOPHONE', name='Français', code='FRAN')
            sub_pc = Subject.objects.create(school=school1, system='FRANCOPHONE', name='Physique-Chimie', code='PC')

            cs1 = ClassSubject.objects.create(school=school1, class_room=c_6eA, subject=sub_math, teacher=teacher_user, coefficient=4.0)
            cs2 = ClassSubject.objects.create(school=school1, class_room=c_6eA, subject=sub_fr, teacher=teacher_user, coefficient=3.0)
            cs3 = ClassSubject.objects.create(school=school1, class_room=c_tleC, subject=sub_math, teacher=teacher_user, coefficient=6.0)

            # Sequences
            seq1 = Sequence.objects.create(school=school1, academic_year=ay, name='Séquence 1', term_number=1, order=1, is_active=True)
            seq2 = Sequence.objects.create(school=school1, academic_year=ay, name='Séquence 2', term_number=1, order=2, is_active=True)

            # Parent & Students
            parent_user, _ = User.objects.get_or_create(
                email='parent.mballa@gmail.com',
                defaults={'first_name': 'Samuel', 'last_name': 'Mballa', 'phone': '+237670112233'}
            )
            parent_user.set_password('Scolyva2026!')
            parent_user.save()
            Membership.objects.create(user=parent_user, school=school1, role=RoleChoices.PARENT)

            s1 = Student.objects.create(
                school=school1, matricule='EXC-2025-001', first_name='Junior', last_name='Mballa',
                gender='M', birth_date='2012-05-14', class_room=c_6eA, parent_user=parent_user,
                father_name='Samuel Mballa', parent_phone='+237670112233'
            )

            s2 = Student.objects.create(
                school=school1, matricule='EXC-2025-002', first_name='Claire', last_name='Ngo Nsoga',
                gender='F', birth_date='2012-09-20', class_room=c_6eA,
                mother_name='Therese Ngo', parent_phone='+237699001122'
            )

            # Fee Structure & Balances
            fc1 = FeeCategory.objects.create(school=school1, name='Scolarité Tranche 1')
            fee1 = FeeStructure.objects.create(
                school=school1, academic_year=ay, level=level_6e, fee_category=fc1, amount=75000.00, due_date='2025-10-15'
            )

            b1 = StudentBalance.objects.create(school=school1, student=s1, total_due=75000.00, total_paid=50000.00, balance_remaining=25000.00)
            b2 = StudentBalance.objects.create(school=school1, student=s2, total_due=75000.00, total_paid=75000.00, balance_remaining=0.00)

            # Payments
            Payment.objects.create(
                school=school1, student=s1, fee_structure=fee1, amount=50000.00,
                payment_method=PaymentMethodChoices.CINETPAY_OM, status=PaymentStatusChoices.COMPLETED,
                transaction_ref='CP-EXCELLENCE-001', receipt_number='REC-20250915-001', paid_at=timezone.now()
            )

            # Grades & Report Card
            g1 = Grade.objects.create(school=school1, student=s1, class_subject=cs1, sequence=seq1, score=16.0, entered_by=teacher_user)
            g2 = Grade.objects.create(school=school1, student=s1, class_subject=cs2, sequence=seq1, score=14.0, entered_by=teacher_user)

            g3 = Grade.objects.create(school=school1, student=s2, class_subject=cs1, sequence=seq1, score=18.0, entered_by=teacher_user)
            g4 = Grade.objects.create(school=school1, student=s2, class_subject=cs2, sequence=seq1, score=15.0, entered_by=teacher_user)

            ReportCard.objects.create(
                school=school1, student=s1, class_room=c_6eA, sequence=seq1,
                total_weighted_score=106.0, total_coefficients=7.0, overall_average=15.14,
                class_rank=2, total_students_in_class=2, appreciation='Très Bien - Félicitations'
            )
            ReportCard.objects.create(
                school=school1, student=s2, class_room=c_6eA, sequence=seq1,
                total_weighted_score=117.0, total_coefficients=7.0, overall_average=16.71,
                class_rank=1, total_students_in_class=2, appreciation='Excellent - Tableau d\'Honneur'
            )

        self.stdout.write(self.style.SUCCESS('--- Initialisation terminée avec succès ! ---'))
