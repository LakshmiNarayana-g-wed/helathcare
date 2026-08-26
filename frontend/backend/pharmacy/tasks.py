import logging
from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.utils import timezone
from twilio.rest import Client

from .models import MedicationReminder

logger = logging.getLogger(__name__)


def send_medication_sms(reminder):
    """Send one Twilio reminder. Credentials always come from environment settings."""
    if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
        raise RuntimeError('Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER.')

    patient_name = reminder.patient.user.first_name or 'there'
    body = f'Healora reminder: Hi {patient_name}, {reminder.message}.'
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    return client.messages.create(body=body, from_=settings.TWILIO_PHONE_NUMBER, to=reminder.phone_number)


@shared_task
def send_due_medication_reminders():
    """Dispatch reminders once per day, after their chosen local schedule time."""
    now = timezone.localtime()
    cutoff = (now - timedelta(minutes=5)).time()
    due = MedicationReminder.objects.filter(
        is_active=True,
        scheduled_time__lte=now.time(),
    ).exclude(last_sent_on=now.date()).select_related('patient__user')

    sent, failed = 0, 0
    for reminder in due:
        # Do not send reminders that were missed by more than five minutes.
        if reminder.scheduled_time < cutoff:
            continue
        try:
            send_medication_sms(reminder)
            reminder.last_sent_on = now.date()
            reminder.save(update_fields=['last_sent_on', 'updated_at'])
            sent += 1
        except Exception:
            failed += 1
            logger.exception('Medication reminder SMS failed for reminder %s', reminder.id)
    return {'sent': sent, 'failed': failed}
