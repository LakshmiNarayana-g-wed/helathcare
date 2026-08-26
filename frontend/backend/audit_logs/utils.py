from .models import AuditLog

def log_audit(user, action, resource_type, resource_id=None, patient_id=None, ip_address=None, metadata=None):
    AuditLog.objects.create(
        user=user if user and user.is_authenticated else None,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        patient_id=str(patient_id) if patient_id else None,
        ip_address=ip_address,
        metadata=metadata
    )
