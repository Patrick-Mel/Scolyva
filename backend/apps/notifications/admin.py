from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'title', 'channel', 'is_read', 'school', 'sent_at')
    list_filter = ('channel', 'is_read', 'school')
    search_fields = ('recipient__email', 'title', 'message')
