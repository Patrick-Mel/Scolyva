from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid

class EducationalSystem(models.TextChoices):
    FRANCOPHONE = 'FRANCOPHONE', 'Système Francophone'
    ANGLOPHONE = 'ANGLOPHONE', 'Anglophone System'
    BOTH = 'BOTH', 'Bilingue / Both Systems'

class SchoolStatus(models.TextChoices):
    TRIAL = 'TRIAL', 'Période d\'essai (14 jours)'
    ACTIVE = 'ACTIVE', 'Abonnement Actif'
    READ_ONLY = 'READ_ONLY', 'Lecture Seule (Abonnement requis)'
    SUSPENDED = 'SUSPENDED', 'Suspendu'


class School(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    edu_system = models.CharField(
        max_length=20,
        choices=EducationalSystem.choices,
        default=EducationalSystem.FRANCOPHONE
    )
    status = models.CharField(
        max_length=20,
        choices=SchoolStatus.choices,
        default=SchoolStatus.TRIAL
    )
    trial_ends_at = models.DateTimeField()
    city = models.CharField(max_length=100, blank=True, default='Douala')
    phone = models.CharField(max_length=50)
    email = models.EmailField()
    director_name = models.CharField(max_length=150, blank=True, default='')
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.slug})"

    def save(self, *args, **kwargs):
        if not self.trial_ends_at:
            self.trial_ends_at = timezone.now() + timedelta(days=14)
        super().save(*args, **kwargs)

    @property
    def is_trial_expired(self):
        return timezone.now() > self.trial_ends_at

    @property
    def has_active_subscription(self):
        return self.subscriptions.filter(
            status='ACTIVE',
            ends_at__gte=timezone.now()
        ).exists()

    @property
    def is_read_only(self):
        if self.status == SchoolStatus.SUSPENDED:
            return True
        if self.has_active_subscription:
            return False
        # If trial is expired and no active sub, it's read-only
        return self.is_trial_expired or self.status == SchoolStatus.READ_ONLY


class SubscriptionPlan(models.Model):
    PLAN_CODES = (
        ('STARTER', 'Starter (Petites écoles)'),
        ('PRO', 'Pro (Écoles moyennes)'),
        ('BUSINESS', 'Business (Grands établissements)'),
        ('ENTERPRISE', 'Enterprise (Groupes scolaires)'),
    )
    
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, choices=PLAN_CODES, unique=True)
    price_xaf = models.DecimalField(max_digits=12, decimal_places=2) # XAF / FCFA
    max_students = models.PositiveIntegerField(default=300)
    features_description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.price_xaf:,.0f} FCFA/an"


class SchoolSubscription(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Actif'),
        ('EXPIRED', 'Expiré'),
        ('CANCELLED', 'Annulé'),
    )

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    starts_at = models.DateTimeField(default=timezone.now)
    ends_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.school.name} - {self.plan.name} ({self.status})"


class PlatformPayment(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('SUCCESS', 'Succès'),
        ('FAILED', 'Échoué'),
    )

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='platform_payments')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='XAF')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    transaction_ref = models.CharField(max_length=100, unique=True)
    cinetpay_token = models.CharField(max_length=255, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, default='CINETPAY')
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_ref} - {self.school.name} - {self.amount} XAF ({self.status})"
