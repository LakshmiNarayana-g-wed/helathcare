from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    action = models.CharField(max_length=255) # LOGIN, ACCESS_PATIENT, MODIFY_APPT, etc.
    resource_type = models.CharField(max_length=100) # PATIENT, APPOINTMENT, REFERRAL, etc.
    resource_id = models.CharField(max_length=100, blank=True, null=True)
    patient_id = models.CharField(max_length=100, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        user_str = self.user.email if self.user else "Anonymous"
        return f"{user_str} performed {self.action} on {self.resource_type} at {self.timestamp}"
