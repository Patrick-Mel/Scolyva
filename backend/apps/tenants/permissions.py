from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied

class IsSchoolActiveOrReadOnly(permissions.BasePermission):
    """
    Enforces read-only access for schools whose 14-day trial has expired
    and do not have an active paid subscription.
    """
    message = "Votre période d'essai de 14 jours a expiré. L'accès est en lecture seule. Veuillez souscrire à un abonnement pour réactiver la création et la modification."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superadmin:
            return True

        school = getattr(request, 'school', None)
        if not school:
            # Fallback to user's first active membership school
            membership = request.user.memberships.filter(is_active=True).first()
            if membership:
                school = membership.school

        if not school:
            return True  # Non-school specific requests (like platform level)

        # Check if school is in read-only mode
        if school.is_read_only:
            # Safe methods (GET, HEAD, OPTIONS) are allowed in read-only mode!
            if request.method in permissions.SAFE_METHODS:
                return True
            # Write operations are forbidden in read-only mode!
            raise PermissionDenied(detail=self.message, code=402)

        return True


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superadmin)


class IsSchoolAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superadmin:
            return True
        school = getattr(request, 'school', None)
        return request.user.memberships.filter(
            role='SCHOOL_ADMIN',
            is_active=True,
            **( {'school': school} if school else {} )
        ).exists()


class IsAccountant(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superadmin:
            return True
        school = getattr(request, 'school', None)
        return request.user.memberships.filter(
            role__in=['ACCOUNTANT', 'SCHOOL_ADMIN'],
            is_active=True,
            **( {'school': school} if school else {} )
        ).exists()


class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superadmin:
            return True
        school = getattr(request, 'school', None)
        return request.user.memberships.filter(
            role__in=['TEACHER', 'SCHOOL_ADMIN'],
            is_active=True,
            **( {'school': school} if school else {} )
        ).exists()


class IsParent(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superadmin:
            return True
        return request.user.memberships.filter(role='PARENT', is_active=True).exists()


class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superadmin:
            return True
        return request.user.memberships.filter(role='STUDENT', is_active=True).exists()
