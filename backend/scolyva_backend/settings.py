import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'scolyva-super-secret-production-key-2026-cameroon')

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party packages
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Scolyva apps
    'apps.tenants',
    'apps.users',
    'apps.academics',
    'apps.finances',
    'apps.attendance',
    'apps.notifications',
    'apps.storage',
    'apps.timetables',
    'apps.exams',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.tenants.middleware.TenantMiddleware',
]

ROOT_URLCONF = 'scolyva_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'scolyva_backend.wsgi.application'

# Database Configuration (PostgreSQL on Render / SQLite locally)
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    try:
        import dj_database_url
        DATABASES = {
            'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
        }
    except ImportError:
        from urllib.parse import urlparse
        url = urlparse(DATABASE_URL)
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': url.path[1:],
                'USER': url.username,
                'PASSWORD': url.password,
                'HOST': url.hostname,
                'PORT': url.port or 5432,
            }
        }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_USER_MODEL = 'users.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 6}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Douala'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
}

# SimpleJWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-school-id',
    'x-tenant-slug',
]

# Cloudflare R2 / S3 Configuration
R2_ACCOUNT_ID = os.environ.get('R2_ACCOUNT_ID', 'scolyva_r2_demo_id')
R2_ACCESS_KEY_ID = os.environ.get('R2_ACCESS_KEY_ID', 'scolyva_access_key')
R2_SECRET_ACCESS_KEY = os.environ.get('R2_SECRET_ACCESS_KEY', 'scolyva_secret_key')
R2_BUCKET_NAME = os.environ.get('R2_BUCKET_NAME', 'scolyva-storage')
R2_ENDPOINT_URL = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
R2_CUSTOM_DOMAIN = os.environ.get('R2_CUSTOM_DOMAIN', 'https://files.scolyva.com')

# CinetPay Gateway Configuration
CINETPAY_API_KEY = os.environ.get('CINETPAY_API_KEY', 'scolyva_cinetpay_apikey_demo')
CINETPAY_SITE_ID = os.environ.get('CINETPAY_SITE_ID', 'scolyva_site_id_demo')
CINETPAY_SECRET_KEY = os.environ.get('CINETPAY_SECRET_KEY', 'scolyva_secret_key_demo')
CINETPAY_NOTIFY_URL = os.environ.get('CINETPAY_NOTIFY_URL', 'https://scolyva.onrender.com/api/v1/finances/payments/webhook/')

# Jazzmin Admin Customization Settings
JAZZMIN_SETTINGS = {
    "site_title": "Scolyva Admin",
    "site_header": "Scolyva SaaS",
    "site_brand": "Scolyva",
    "welcome_sign": "Bienvenue dans l'administration Super Admin Scolyva",
    "copyright": "Scolyva SaaS - Patrick Melaga",
    "search_model": ["users.User", "tenants.School", "academics.Student"],
    "show_ui_builder": False,
    "topmenu_links": [
        {"name": "Accueil", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Site Vitrine", "url": "https://scolyva.vercel.app", "new_window": True},
    ],
    "icons": {
        "users.User": "fas fa-user-shield",
        "users.Membership": "fas fa-id-badge",
        "tenants.School": "fas fa-school",
        "tenants.SubscriptionPlan": "fas fa-layer-group",
        "tenants.SchoolSubscription": "fas fa-file-contract",
        "academics.AcademicYear": "fas fa-calendar-alt",
        "academics.Level": "fas fa-graduation-cap",
        "academics.ClassRoom": "fas fa-chalkboard",
        "academics.Subject": "fas fa-book",
        "academics.ClassSubject": "fas fa-book-open",
        "academics.Sequence": "fas fa-list-ol",
        "academics.Student": "fas fa-user-graduate",
        "academics.Grade": "fas fa-star",
        "academics.ReportCard": "fas fa-file-invoice",
        "finances.FeeCategory": "fas fa-tags",
        "finances.FeeStructure": "fas fa-file-invoice-dollar",
        "finances.StudentBalance": "fas fa-wallet",
        "finances.Payment": "fas fa-money-bill-wave",
        "attendance.AttendanceRecord": "fas fa-clipboard-check",
        "attendance.Absence": "fas fa-user-slash",
        "notifications.Notification": "fas fa-bell",
    },
    "default_icon_parents": "fas fa-folder",
    "default_icon_children": "fas fa-file",
}

JAZZMIN_UI_TWEAKS = {
    "navbar": "navbar-dark bg-dark",
    "theme": "pulse",
    "dark_mode_theme": "darkly",
}
