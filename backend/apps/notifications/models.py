from django.db import models
from apps.tenants.abstracts import TenantModel
from apps.users.models import User

class Notification(TenantModel):
    CHANNEL_CHOICES = (
        ('IN_APP', 'In-App Dashboard'),
        ('EMAIL', 'Email'),
        ('SMS', 'SMS Mobile'),
    )

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='IN_APP')
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        rcp = self.recipient.email if self.recipient else "Destinataire"
        return f"Notif to {rcp}: {self.title}"
