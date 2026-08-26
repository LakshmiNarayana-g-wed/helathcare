from django.core.management.base import BaseCommand

from pharmacy.tasks import send_due_medication_reminders


class Command(BaseCommand):
    help = 'Send medication reminders that are due now. Useful for a cron or Task Scheduler fallback.'

    def handle(self, *args, **options):
        result = send_due_medication_reminders.run()
        self.stdout.write(self.style.SUCCESS(
            f"Medication reminders processed: {result['sent']} sent, {result['failed']} failed."
        ))
