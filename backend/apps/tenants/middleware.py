from apps.tenants.models import School
from apps.tenants.abstracts import set_current_school, clear_current_school

class TenantMiddleware:
    """
    Middleware that extracts the school context for each request
    from HTTP headers, host subdomains, or query parameters.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        school = self.resolve_school(request)
        request.school = school
        set_current_school(school)

        try:
            response = self.get_response(request)
        finally:
            clear_current_school()

        return response

    def resolve_school(self, request):
        # 1. Header: X-School-ID
        school_id = request.headers.get('X-School-ID') or request.META.get('HTTP_X_SCHOOL_ID')
        if school_id:
            try:
                return School.objects.get(id=school_id)
            except (School.DoesNotExist, ValueError):
                pass

        # 2. Header: X-Tenant-Slug
        tenant_slug = request.headers.get('X-Tenant-Slug') or request.META.get('HTTP_X_TENANT_SLUG')
        if tenant_slug:
            try:
                return School.objects.get(slug=tenant_slug)
            except School.DoesNotExist:
                pass

        # 3. Query Parameter: ?school_id= or ?tenant_slug=
        query_school_id = request.GET.get('school_id')
        if query_school_id:
            try:
                return School.objects.get(id=query_school_id)
            except (School.DoesNotExist, ValueError):
                pass

        query_slug = request.GET.get('tenant_slug')
        if query_slug:
            try:
                return School.objects.get(slug=query_slug)
            except School.DoesNotExist:
                pass

        # 4. Host Subdomain: {slug}.scolyva.com
        host = request.get_host().split(':')[0]
        parts = host.split('.')
        if len(parts) >= 3 and parts[0] not in ('www', 'admin', 'api', 'app'):
            slug = parts[0]
            try:
                return School.objects.get(slug=slug)
            except School.DoesNotExist:
                pass

        # 5. Fallback: User authenticated membership school
        if hasattr(request, 'user') and request.user.is_authenticated:
            user_membership = request.user.memberships.filter(is_active=True).first()
            if user_membership:
                return user_membership.school

        return None
