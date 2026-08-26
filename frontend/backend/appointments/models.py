from django.db import models
from django.conf import settings
from patients.models import Patient
from doctors.models import Doctor

class ConsultationType(models.TextChoices):
    ONLINE = 'ONLINE', 'Online Consultation'
    IN_PERSON = 'IN_PERSON', 'In-Person Visit'

class AppointmentStatus(models.TextChoices):
    REQUESTED = 'REQUESTED', 'Requested'
    CONFIRMED = 'CONFIRMED', 'Confirmed'
    RESCHEDULED = 'RESCHEDULED', 'Rescheduled'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'
    NO_SHOW = 'NO_SHOW', 'No Show'

class Appointment(models.Model):
    appointment_id = models.CharField(max_length=30, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    consultation_type = models.CharField(
        max_length=20, 
        choices=ConsultationType.choices, 
        default=ConsultationType.ONLINE
    )
    reason = models.TextField()
    status = models.CharField(
        max_length=25, 
        choices=AppointmentStatus.choices, 
        default=AppointmentStatus.REQUESTED
    )
    notes = models.TextField(blank=True, null=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.appointment_id}: {self.patient} with {self.doctor} ({self.appointment_date})"
