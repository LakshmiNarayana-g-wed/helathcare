from django.core.management.base import BaseCommand
from appointments.tasks import send_appointment_reminders, detect_missed_appointments, send_followup_reminders

class Command(BaseCommand):
    help = 'Executes clinical background checks and reminders scans synchronously (Mock task worker)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Running appointment reminders check...')
        res1 = send_appointment_reminders()
        self.stdout.write(f'Result: {res1}')

        self.stdout.write('Running missed appointment detector...')
        res2 = detect_missed_appointments()
        self.stdout.write(f'Result: {res2}')

        self.stdout.write('Running follow-up checkups reminders scan...')
        res3 = send_followup_reminders()
        self.stdout.write(f'Result: {res3}')

        self.stdout.write(self.style.SUCCESS('Background task runner execution complete!'))
