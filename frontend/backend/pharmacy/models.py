from django.db import models
from django.conf import settings
from patients.models import Patient
from doctors.models import Doctor

class MedicineCategory(models.TextChoices):
    ANTIBIOTICS = 'ANTIBIOTICS', 'Antibiotics'
    PAIN_RELIEF = 'PAIN_RELIEF', 'Pain Relief'
    VITAMINS = 'VITAMINS', 'Vitamins'
    FIRST_AID = 'FIRST_AID', 'First Aid'
    MEDICAL_EQUIPMENT = 'MEDICAL_EQUIPMENT', 'Medical Equipment'
    OTHER = 'OTHER', 'Other'

class StockStatus(models.TextChoices):
    IN_STOCK = 'IN_STOCK', 'In Stock'
    LOW_STOCK = 'LOW_STOCK', 'Low Stock'
    OUT_OF_STOCK = 'OUT_OF_STOCK', 'Out of Stock'

class Medicine(models.Model):
    name = models.CharField(max_length=150)
    generic_name = models.CharField(max_length=150)
    category = models.CharField(
        max_length=40, 
        choices=MedicineCategory.choices, 
        default=MedicineCategory.OTHER
    )
    manufacturer = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    stock_status = models.CharField(
        max_length=30, 
        choices=StockStatus.choices, 
        default=StockStatus.IN_STOCK
    )
    prescription_required = models.BooleanField(default=False)
    image = models.ImageField(upload_to='medicines/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto update stock status
        if self.stock_quantity == 0:
            self.stock_status = StockStatus.OUT_OF_STOCK
        elif self.stock_quantity <= 10:
            self.stock_status = StockStatus.LOW_STOCK
        else:
            self.stock_status = StockStatus.IN_STOCK
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.generic_name})"

class Prescription(models.Model):
    prescription_id = models.CharField(max_length=30, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='prescriptions')
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    instructions = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, default='ACTIVE')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription {self.prescription_id} for {self.patient}"


class ReminderPeriod(models.TextChoices):
    MORNING = 'MORNING', 'Morning (6:00 AM - 11:00 AM)'
    AFTERNOON = 'AFTERNOON', 'Afternoon (12:00 PM - 3:00 PM)'
    EVENING = 'EVENING', 'Evening (7:00 PM - 11:00 PM)'


class MedicationReminder(models.Model):
    """A patient-controlled daily SMS reminder for one prescription."""
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='reminders', blank=True, null=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medication_reminders')
    message = models.CharField(max_length=160, default='Take your medicine')
    period = models.CharField(max_length=15, choices=ReminderPeriod.choices)
    scheduled_time = models.TimeField(help_text='Local reminder time in the selected period')
    phone_number = models.CharField(max_length=20, help_text='E.164 number, e.g. +919876543210')
    is_active = models.BooleanField(default=True)
    last_sent_on = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['patient', 'period'], name='one_reminder_per_patient_period')
        ]
        ordering = ['scheduled_time']

    def __str__(self):
        return f"{self.message} at {self.scheduled_time} ({self.patient})"

class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    VERIFICATION_REQUIRED = 'VERIFICATION_REQUIRED', 'Verification Required'
    PROCESSING = 'PROCESSING', 'Processing'
    READY = 'READY', 'Ready'
    DISPATCHED = 'DISPATCHED', 'Dispatched'
    DELIVERED = 'DELIVERED', 'Delivered'
    CANCELLED = 'CANCELLED', 'Cancelled'

class PharmacyOrder(models.Model):
    order_id = models.CharField(max_length=30, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='orders')
    prescription = models.ForeignKey(Prescription, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=30, 
        choices=OrderStatus.choices, 
        default=OrderStatus.PENDING
    )
    delivery_address = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_id} ({self.status})"
