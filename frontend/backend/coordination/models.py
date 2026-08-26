from django.db import models
from django.conf import settings
from patients.models import Patient

class TaskType(models.TextChoices):
    APPOINTMENT = 'APPOINTMENT', 'Appointment'
    REFERRAL = 'REFERRAL', 'Referral'
    DIAGNOSTIC = 'DIAGNOSTIC', 'Diagnostic'
    REPORT_REVIEW = 'REPORT_REVIEW', 'Report Review'
    PHARMACY = 'PHARMACY', 'Pharmacy'
    FOLLOW_UP = 'FOLLOW_UP', 'Follow Up'
    ADMINISTRATIVE = 'ADMINISTRATIVE', 'Administrative'

class TaskStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'
    ESCALATED = 'ESCALATED', 'Escalated'

class TaskPriority(models.TextChoices):
    LOW = 'LOW', 'Low'
    NORMAL = 'NORMAL', 'Normal'
    HIGH = 'HIGH', 'High'
    URGENT = 'URGENT', 'Urgent'

class CoordinationTask(models.Model):
    task_id = models.CharField(max_length=30, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='tasks')
    task_type = models.CharField(
        max_length=30, 
        choices=TaskType.choices, 
        default=TaskType.ADMINISTRATIVE
    )
    title = models.CharField(max_length=150)
    description = models.TextField()
    priority = models.CharField(
        max_length=20, 
        choices=TaskPriority.choices, 
        default=TaskPriority.NORMAL
    )
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    source = models.CharField(max_length=30, default='SYSTEM') # SYSTEM, DOCTOR, AI_AGENT
    status = models.CharField(
        max_length=30, 
        choices=TaskStatus.choices, 
        default=TaskStatus.PENDING
    )
    due_date = models.DateField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_tasks')
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.task_id}: {self.title} ({self.status})"
