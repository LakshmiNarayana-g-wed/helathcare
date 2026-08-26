from django.db import models
from django.conf import settings
from patients.models import Patient
from doctors.models import Doctor

class InvestigationStatus(models.TextChoices):
    REQUESTED = 'REQUESTED', 'Requested'
    SCHEDULED = 'SCHEDULED', 'Scheduled'
    SAMPLE_COLLECTED = 'SAMPLE_COLLECTED', 'Sample Collected'
    PROCESSING = 'PROCESSING', 'Processing'
    COMPLETED = 'COMPLETED', 'Completed'
    REPORT_AVAILABLE = 'REPORT_AVAILABLE', 'Report Available'
    CANCELLED = 'CANCELLED', 'Cancelled'

class Investigation(models.Model):
    investigation_id = models.CharField(max_length=30, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='investigations')
    requested_by = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='requested_investigations')
    test_name = models.CharField(max_length=150)
    test_type = models.CharField(max_length=100)
    diagnostic_center = models.CharField(max_length=200)
    scheduled_date = models.DateField()
    status = models.CharField(
        max_length=30, 
        choices=InvestigationStatus.choices, 
        default=InvestigationStatus.REQUESTED
    )
    instructions = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.investigation_id}: {self.test_name} for {self.patient}"

class ReviewStatus(models.TextChoices):
    PENDING_REVIEW = 'PENDING_REVIEW', 'Pending Review'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    REVIEWED = 'REVIEWED', 'Reviewed'

class DiagnosticReport(models.Model):
    investigation = models.OneToOneField(Investigation, on_delete=models.CASCADE, related_name='report')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reports')
    report_file = models.FileField(upload_to='reports/', blank=True, null=True)
    
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_reports')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    review_status = models.CharField(
        max_length=30, 
        choices=ReviewStatus.choices, 
        default=ReviewStatus.PENDING_REVIEW
    )
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='reviewed_reports', blank=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Report for {self.investigation.investigation_id} ({self.review_status})"
