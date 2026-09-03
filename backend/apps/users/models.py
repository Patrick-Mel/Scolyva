from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_superadmin', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField('Adresse email', unique=True, db_index=True)
    phone = models.CharField('Téléphone', max_length=50, blank=True, default='')
    first_name = models.CharField('Prénom', max_length=150, blank=True, default='')
    last_name = models.CharField('Nom', max_length=150, blank=True, default='')
    photo_url = models.URLField('Photo de profil', max_length=500, blank=True, null=True)
    is_superadmin = models.BooleanField('Super Admin Scolyva', default=False)
    preferred_language = models.CharField('Langue préférée', max_length=5, default='fr', choices=[('fr', 'Français'), ('en', 'English')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else (self.email or "Utilisateur")


class RoleChoices(models.TextChoices):
    SCHOOL_ADMIN = 'SCHOOL_ADMIN', 'Administrateur d\'établissement'
    ACCOUNTANT = 'ACCOUNTANT', 'Comptable / Intendant'
    TEACHER = 'TEACHER', 'Enseignant'
    PARENT = 'PARENT', 'Parent d\'élève'
    STUDENT = 'STUDENT', 'Élève'


class Membership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    school = models.ForeignKey('tenants.School', on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=30, choices=RoleChoices.choices)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'school', 'role')
        ordering = ['-created_at']

    def __str__(self):
        u_email = self.user.email if self.user else "User"
        sch_name = self.school.name if self.school else "École"
        return f"{u_email} - {self.get_role_display()} à {sch_name}"
