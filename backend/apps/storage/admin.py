from django.contrib import admin
from .models import StorageFile

@admin.register(StorageFile)
class StorageFileAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'school', 'file_type', 'uploaded_by', 'uploaded_at')
    list_filter = ('file_type', 'school')
    search_fields = ('file_name', 'r2_key')
