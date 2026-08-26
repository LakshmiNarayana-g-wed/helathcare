from django.db import models
from django.conf import settings

class Doctor(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    doctor_id = models.CharField(max_length=30, unique=True)
    specialization = models.CharField(max_length=100)
    qualification = models.CharField(max_length=200)
    experience_years = models.PositiveIntegerField()
    hospital = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2)
    bio = models.TextField()
    languages = models.CharField(max_length=200, help_text="Comma-separated languages spoken")
    location = models.CharField(max_length=150)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    is_available = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.specialization})"
