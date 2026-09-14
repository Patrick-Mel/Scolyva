from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
import json

signer = TimestampSigner(salt='scolyva.qr.attendance.v1')

def generate_student_qr_token(student):
    """
    Generates a cryptographically signed QR code token for a student.
    Payload: student_id:school_id:matricule
    """
    payload = f"{student.id}:{student.school_id}:{student.matricule}"
    token = signer.sign(payload)
    return token

def verify_student_qr_token(token, max_age=None):
    """
    Verifies a student QR code token signature.
    Returns dict {student_id, school_id, matricule} if valid, raises ValueError if invalid.
    """
    try:
        unsigned_payload = signer.unsign(token, max_age=max_age)
        parts = unsigned_payload.split(':')
        if len(parts) >= 3:
            return {
                'student_id': parts[0],
                'school_id': parts[1],
                'matricule': parts[2]
            }
        raise ValueError("Jeton QR malformé")
    except (BadSignature, SignatureExpired) as e:
        raise ValueError(f"Jeton QR invalide ou expiré: {str(e)}")
