from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import boto3
from botocore.config import Config
import uuid
import logging

logger = logging.getLogger(__name__)

class PresignUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_name = request.data.get('file_name', 'upload.jpg')
        content_type = request.data.get('content_type', 'image/jpeg')
        category = request.data.get('category', 'documents') # e.g. 'logos', 'students', 'bulletins'

        school = getattr(request, 'school', None)
        school_slug = school.slug if school else 'platform'

        file_extension = file_name.split('.')[-1] if '.' in file_name else 'bin'
        unique_file_key = f"{school_slug}/{category}/{uuid.uuid4().hex}.{file_extension}"

        # Initialize S3 client configured for Cloudflare R2
        try:
            s3_client = boto3.client(
                's3',
                endpoint_url=settings.R2_ENDPOINT_URL,
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                config=Config(signature_version='s3v4'),
                region_name='auto'
            )

            upload_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': settings.R2_BUCKET_NAME,
                    'Key': unique_file_key,
                    'ContentType': content_type
                },
                ExpiresIn=3600 # 1 hour validity
            )
            public_url = f"{settings.R2_CUSTOM_DOMAIN}/{unique_file_key}"

        except Exception as e:
            # Local fallback mock URL if AWS/R2 credentials are demo/offline
            logger.warning(f"R2 presigned URL fallback mode active: {e}")
            upload_url = f"https://r2-mock.scolyva.com/upload/{unique_file_key}"
            public_url = f"https://files.scolyva.com/{unique_file_key}"

        return Response({
            'upload_url': upload_url,
            'file_key': unique_file_key,
            'public_url': public_url,
            'expires_in_seconds': 3600
        }, status=status.HTTP_200_OK)


class PresignDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_key = request.data.get('file_key')
        if not file_key:
            return Response({'error': 'file_key requis.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            s3_client = boto3.client(
                's3',
                endpoint_url=settings.R2_ENDPOINT_URL,
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                config=Config(signature_version='s3v4'),
                region_name='auto'
            )

            download_url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': settings.R2_BUCKET_NAME,
                    'Key': file_key
                },
                ExpiresIn=3600
            )

        except Exception as e:
            logger.warning(f"R2 presigned download fallback mode: {e}")
            download_url = f"https://files.scolyva.com/{file_key}"

        return Response({
            'download_url': download_url,
            'file_key': file_key,
            'expires_in_seconds': 3600
        }, status=status.HTTP_200_OK)
