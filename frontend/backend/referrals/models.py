from django.db import models
from django.conf import settings
from patients.models import Patient
from doctors.models import Doctor

class ReferralPriority(models.TextChoices):
    LOW = 'LOW', 'Low'
    NORMAL = 'NORMAL', 'Normal'
    HIGH = 'HIGH', 'High'
    URGENT = 'URGENT', 'Urgent'

class ReferralStatus(models.TextChoices):
    REQUESTED = 'REQUESTED', 'Requested'
    PENDING_REVIEW = 'PENDING_REVIEW', 'Pending Review'
    APPROVED = 'APPROVED', 'Approved'
    APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED', 'Appointment Scheduled'
    COMPLETED = 'COMPLETED', 'Completed'
    FOLLOW_UP_REQUIRED = 'FOLLOW_UP_REQUIRED', 'Follow-up Required'
    CLOSED = 'CLOSED', 'Closed'

class Referral(models.Model):
    referral_id = models.CharField(max_length=30, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='referrals')
    referring_doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='sent_referrals')
    specialist = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_referrals')
    specialization = models.CharField(max_length=100)
    reason = models.TextField()
    priority = models.CharField(
        max_length=20, 
        choices=ReferralPriority.choices, 
        default=ReferralPriority.NORMAL
    )
    status = models.CharField(
        max_length=30, 
        choices=ReferralStatus.choices, 
        default=ReferralStatus.REQUESTED
    )
    requested_date = models.DateField(auto_now_add=True)
    appointment_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Referral {self.referral_id} for {self.patient} to {self.specialization}"
