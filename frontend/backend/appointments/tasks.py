import datetime
from celery import shared_task
from django.contrib.auth import get_user_model
from django.apps import apps

# We import inside functions to avoid circular import patterns
User = get_user_model()

@shared_task
def send_appointment_reminders():
    """Reminds patients of appointments scheduled for tomorrow."""
    Appointment = apps.get_model('appointments', 'Appointment')
    Notification = apps.get_model('notifications', 'Notification')
    
    tomorrow = datetime.date.today() + datetime.timedelta(days=1)
    appts = Appointment.objects.filter(appointment_date=tomorrow, status='CONFIRMED')
    
    count = 0
    for apt in appts:
        Notification.objects.create(
            user=apt.patient.user,
            type='APPOINTMENT_REMINDER',
            title='Upcoming Appointment Reminder',
            message=f"Hello, this is a reminder for your appointment with Dr. {apt.doctor.user.last_name} tomorrow at {apt.start_time.strftime('%H:%M')}."
        )
        count += 1
    return f"Dispatched {count} appointment reminders."

@shared_task
def detect_missed_appointments():
    """Detects yesterday's confirmed appointments that were not completed and flags them as NO_SHOW."""
    Appointment = apps.get_model('appointments', 'Appointment')
    yesterday = datetime.date.today() - datetime.timedelta(days=1)
    
    appts = Appointment.objects.filter(appointment_date=yesterday, status='CONFIRMED')
    count = appts.update(status='NO_SHOW')
    return f"Flagged {count} appointments as Missed / No-Show."

@shared_task
def send_followup_reminders():
    """Triggers notifications for patients with followups scheduled in the next 3 days."""
    FollowUp = apps.get_model('followups', 'FollowUp')
    Notification = apps.get_model('notifications', 'Notification')
    
    target_date = datetime.date.today() + datetime.timedelta(days=3)
    followups = FollowUp.objects.filter(followup_date=target_date, status='PENDING')
    
    count = 0
    for fl in followups:
        Notification.objects.create(
            user=fl.patient.user,
            type='FOLLOWUP_REMINDER',
            title='Scheduled Follow-up Checkup',
            message=f"Reminder: You have a follow-up consultation scheduled with Dr. {fl.doctor.user.last_name} on {fl.followup_date}."
        )
        count += 1
    return f"Dispatched {count} follow-up checkup reminders."
