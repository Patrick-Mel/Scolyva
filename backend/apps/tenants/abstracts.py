from django.db import models
import threading

_thread_locals = threading.local()

def get_current_school():
    """Retrieve the current school object from thread local context."""
    return getattr(_thread_locals, 'school', None)

def set_current_school(school):
    """Set the current school object in thread local context."""
    _thread_locals.school = school

def clear_current_school():
    """Clear current school from thread local context."""
    _thread_locals.school = None


class TenantQuerySet(models.QuerySet):
    def for_school(self, school):
        if school:
            return self.filter(school=school)
        return self


class TenantManager(models.Manager):
    def get_queryset(self):
        qs = TenantQuerySet(self.model, using=self._db)
        school = get_current_school()
        if school:
            return qs.filter(school=school)
        return qs

    def for_school(self, school):
        return self.get_queryset().for_school(school)


class TenantModel(models.Model):
    """
    Abstract base model that enforces tenant isolation.
    Every school-scoped entity must inherit from this model.
    """
    school = models.ForeignKey(
        'tenants.School',
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
        db_index=True
    )

    objects = TenantManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not hasattr(self, 'school') or self.school_id is None:
            current_school = get_current_school()
            if current_school:
                self.school = current_school
        super().save(*args, **kwargs)
