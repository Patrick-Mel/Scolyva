from django.contrib import admin
from .models import SMSNotification

@admin.register(SMSNotification)
class SMSNotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient_phone', 'school', 'message_type', 'status', 'sent_at')
    list_filter = ('message_type', 'status', 'school')
    search_fields = ('recipient_phone', 'message_text')
