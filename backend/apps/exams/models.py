from django.db import models
from apps.tenants.abstracts import TenantModel
from apps.academics.models import ClassRoom, ClassSubject, Student
from apps.users.models import User
import uuid

class Exam(TenantModel):
    title = models.CharField('Titre de l\'examen', max_length=200) # e.g. "Évaluation Séquence 3 - Mathématiques"
    description = models.TextField('Consignes & Instructions', blank=True, default='')
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='exams')
    class_subject = models.ForeignKey(ClassSubject, on_delete=models.CASCADE, related_name='exams')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_exams')
    
    start_time = models.DateTimeField('Heure d\'ouverture')
    end_time = models.DateTimeField('Heure de fermeture')
    duration_minutes = models.PositiveIntegerField('Durée limite (minutes)', default=60)
    total_points = models.FloatField('Barème total (points)', default=20.0)
    
    is_published = models.BooleanField('Examen publié', default=False)
    shuffle_questions = models.BooleanField('Mélanger les questions', default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_time']

    def __str__(self):
        cls = self.class_room.name if self.class_room else ''
        subj = self.class_subject.subject.name if (self.class_subject and self.class_subject.subject) else ''
        return f"{self.title} - {cls} ({subj})"


class ExamQuestion(TenantModel):
    QUESTION_TYPE_CHOICES = (
        ('MCQ', 'QCM (Choix Multiple)'),
        ('SHORT_ANSWER', 'Réponse Courte Textuelle'),
        ('ESSAY', 'Question Ouverte / Dissertation'),
    )

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField('Type de question', max_length=30, choices=QUESTION_TYPE_CHOICES, default='MCQ')
    text = models.TextField('Énoncé de la question')
    points = models.FloatField('Points attribués', default=2.0)
    options = models.JSONField('Options QCM (liste)', blank=True, default=list) # e.g. ["A) Option 1", "B) Option 2"]
    correct_answer = models.TextField('Réponse exacte (pour QCM ou autocorrection)', blank=True, default='')
    order = models.PositiveIntegerField('Ordre d\'affichage', default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        ex = self.exam.title if self.exam else ''
        return f"Q{self.order} [{self.question_type}] ({self.points} pts) - {ex}"


class ExamSubmission(TenantModel):
    STATUS_CHOICES = (
        ('IN_PROGRESS', 'Examen en cours'),
        ('SUBMITTED', 'Copie remise'),
        ('GRADED', 'Copie corrigée'),
    )

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_submissions')
    start_time = models.DateTimeField('Date/Heure de début', auto_now_add=True)
    submit_time = models.DateTimeField('Date/Heure de remise', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')
    
    total_score = models.FloatField('Note finale attribuée', null=True, blank=True)
    integrity_score = models.FloatField('Score d\'intégrité (%)', default=100.0) # 100% = Clean, <70% = High Risk
    auto_submitted = models.BooleanField('Soumis automatiquement par expiration du temps', default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('exam', 'student')
        ordering = ['-start_time']

    def __str__(self):
        st = f"{self.student.last_name} {self.student.first_name}" if self.student else "Élève"
        ex = self.exam.title if self.exam else "Examen"
        return f"Copie {st} - {ex} [{self.status}] (Intégrité: {self.integrity_score:.0f}%)"


class ExamAnswer(TenantModel):
    submission = models.ForeignKey(ExamSubmission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name='given_answers')
    answer_text = models.TextField('Texte saisi par l\'élève', blank=True, default='')
    selected_options = models.JSONField('Choix de l\'élève (QCM)', blank=True, default=list)
    score_granted = models.FloatField('Points accordés', null=True, blank=True)
    teacher_comment = models.TextField('Appréciation / Remarque enseignant', blank=True, default='')
    response_time_seconds = models.PositiveIntegerField('Temps passé sur la question (sec)', default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('submission', 'question')

    def __str__(self):
        return f"Réponse Q{self.question.order} - Copie {self.submission_id}"


class ExamIntegrityLog(TenantModel):
    EVENT_TYPE_CHOICES = (
        ('TAB_BLUR', 'Changement d\'onglet / Quitte l\'écran'),
        ('WINDOW_FOCUS_LOSS', 'Perte de focus fenêtre'),
        ('COPY_PASTE_ATTEMPT', 'Tentative de copier / coller'),
        ('RIGHT_CLICK_ATTEMPT', 'Tentative de clic droit'),
        ('RAPID_SUBMISSION', 'Réponse soumise anormalement vite'),
    )

    submission = models.ForeignKey(ExamSubmission, on_delete=models.CASCADE, related_name='integrity_logs')
    event_type = models.CharField('Type d\'événement', max_length=50, choices=EVENT_TYPE_CHOICES)
    timestamp = models.DateTimeField('Horodatage exact', auto_now_add=True)
    details = models.JSONField('Métadonnées système', blank=True, default=dict)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        st = f"{self.submission.student.last_name}" if (self.submission and self.submission.student) else "Élève"
        return f"Alerte [{self.get_event_type_display()}] - {st} à {self.timestamp.strftime('%H:%M:%S')}"
