from django.db import models
from django.conf import settings
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment

class FollowUpStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    SCHEDULED = 'SCHEDULED', 'Scheduled'
    COMPLETED = 'COMPLETED', 'Completed'
    MISSED = 'MISSED', 'Missed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class FollowUp(models.Model):
    followup_id = models.CharField(max_length=30, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='followups')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='followups')
    related_appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='followups')
    followup_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(
        max_length=25, 
        choices=FollowUpStatus.choices, 
        default=FollowUpStatus.PENDING
    )
    notes = models.TextField(blank=True, null=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"FollowUp {self.followup_id} for {self.patient} on {self.followup_date}"
