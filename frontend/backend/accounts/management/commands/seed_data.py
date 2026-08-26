import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import UserRole
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment, ConsultationType, AppointmentStatus
from referrals.models import Referral, ReferralStatus, ReferralPriority
from diagnostics.models import Investigation, DiagnosticReport, InvestigationStatus, ReviewStatus
from pharmacy.models import Medicine, Prescription, PharmacyOrder, MedicineCategory, StockStatus
from followups.models import FollowUp, FollowUpStatus
from notifications.models import Notification
from coordination.models import CoordinationTask, TaskStatus, TaskPriority, TaskType

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with clinical mock data for Healora platform'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing data...')
        
        # Clear data in order of dependency
        CoordinationTask.objects.all().delete()
        Notification.objects.all().delete()
        FollowUp.objects.all().delete()
        PharmacyOrder.objects.all().delete()
        Prescription.objects.all().delete()
        Medicine.objects.all().delete()
        DiagnosticReport.objects.all().delete()
        Investigation.objects.all().delete()
        Referral.objects.all().delete()
        Appointment.objects.all().delete()
        Doctor.objects.all().delete()
        Patient.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write('Seeding users for roles...')
        
        # Create users
        admin_user = User.objects.create_superuser(
            email='admin@healora.com',
            password='Password123',
            first_name='Admin',
            last_name='Staff'
        )
        
        patient_user = User.objects.create_user(
            email='patient@healora.com',
            password='Password123',
            first_name='Mohammad',
            last_name='Jaber Abdullah',
            phone='+1 (415) 555-4928',
            role=UserRole.PATIENT,
            is_verified=True
        )

        doctor_user = User.objects.create_user(
            email='doctor@healora.com',
            password='Password123',
            first_name='John',
            last_name='Smith',
            phone='+1 (415) 555-9081',
            role=UserRole.DOCTOR,
            is_verified=True
        )

        coordinator_user = User.objects.create_user(
            email='coordinator@healora.com',
            password='Password123',
            first_name='Sarah',
            last_name='Jenkins',
            role=UserRole.CARE_COORDINATOR,
            is_verified=True
        )

        diagnostic_user = User.objects.create_user(
            email='diagnostics@healora.com',
            password='Password123',
            first_name='Robert',
            last_name='Lee',
            role=UserRole.DIAGNOSTIC_STAFF,
            is_verified=True
        )

        pharmacist_user = User.objects.create_user(
            email='pharmacist@healora.com',
            password='Password123',
            first_name='Emily',
            last_name='Tanaka',
            role=UserRole.PHARMACIST,
            is_verified=True
        )

        self.stdout.write('Seeding profiles...')

        # Patient Profile
        patient = Patient.objects.create(
            user=patient_user,
            patient_id='AN01',
            date_of_birth=datetime.date(1962, 5, 14),
            gender='Male',
            blood_group='A+',
            height=170.00,
            weight=70.00,
            emergency_contact='Aisha Abdullah (+1 415-555-0099)',
            address='1840 Parkside Blvd, Suite 400, Los Angeles, CA 90017'
        )

        # Doctor Profile
        doctor = Doctor.objects.create(
            user=doctor_user,
            doctor_id='D2001',
            specialization='Cardiology',
            qualification='MD - Cardiology, FACC',
            experience_years=15,
            hospital='Healora Medical Center',
            department='Cardiology Dept',
            consultation_fee=800.00,
            bio='Dr. John Smith is a cardiothoracic specialist dealing with complex cardiovascular surgeries and valve replacements.',
            languages='English, Spanish',
            location='Los Angeles, USA',
            rating=4.9,
            is_available=True
        )

        self.stdout.write('Seeding clinical events (Appointments, Referrals)...')

        # Appointment
        appointment = Appointment.objects.create(
            appointment_id='APT-10001',
            patient=patient,
            doctor=doctor,
            appointment_date=datetime.date.today() + datetime.timedelta(days=7),
            start_time=datetime.time(10, 30),
            end_time=datetime.time(11, 00),
            consultation_type=ConsultationType.IN_PERSON,
            reason='Post-operative Open Heart Surgery valve checkup.',
            status=AppointmentStatus.CONFIRMED,
            created_by=coordinator_user
        )

        # Referral
        referral = Referral.objects.create(
            referral_id='REF-10001',
            patient=patient,
            referring_doctor=doctor,
            specialization='Neurology',
            reason='Evaluate mild post-operative cognitive changes or sleep disruptions.',
            priority=ReferralPriority.HIGH,
            status=ReferralStatus.PENDING_REVIEW
        )

        self.stdout.write('Seeding diagnostics & reports...')

        # Investigation
        investigation = Investigation.objects.create(
            investigation_id='INV-10001',
            patient=patient,
            requested_by=doctor,
            test_name='Lipid Profile Test',
            test_type='Blood Pathology',
            diagnostic_center='Healora Lab Center',
            scheduled_date=datetime.date.today() - datetime.timedelta(days=2),
            status=InvestigationStatus.COMPLETED,
            instructions='Fast for 12 hours prior to draw.'
        )

        # Diagnostic Report
        report = DiagnosticReport.objects.create(
            investigation=investigation,
            patient=patient,
            report_file=None, # In simulation, file path null is supported
            uploaded_by=diagnostic_user,
            review_status=ReviewStatus.PENDING_REVIEW
        )

        self.stdout.write('Seeding medicines & prescriptions...')

        # Medicines
        med1 = Medicine.objects.create(
            name='MedKit Advanced Care',
            generic_name='First Aid Supplies',
            category=MedicineCategory.FIRST_AID,
            manufacturer='Healora Tech Corp',
            description='Complete emergency clinical care toolkit.',
            price=2000.00,
            stock_quantity=25
        )

        med2 = Medicine.objects.create(
            name='Antibiotic Amoxicillin X',
            generic_name='Amoxicillin 500mg',
            category=MedicineCategory.ANTIBIOTICS,
            manufacturer='BioPharma Labs',
            description='Broad spectrum penicillin antibiotic.',
            price=1200.00,
            stock_quantity=15,
            prescription_required=True
        )

        med3 = Medicine.objects.create(
            name='Pain Relief Ibuprofen Y',
            generic_name='Ibuprofen 400mg',
            category=MedicineCategory.PAIN_RELIEF,
            manufacturer='Generic Health Solutions',
            description='Anti-inflammatory NSAID analgesic.',
            price=800.00,
            stock_quantity=100
        )

        # Prescription
        prescription = Prescription.objects.create(
            prescription_id='PRC-10001',
            patient=patient,
            doctor=doctor,
            medicine=med2,
            dosage='1 tablet',
            frequency='Twice daily',
            duration='14 days',
            instructions='Take after meals with water.',
            status='ACTIVE'
        )

        # Pharmacy Order
        order = PharmacyOrder.objects.create(
            order_id='ORD-10001',
            patient=patient,
            prescription=prescription,
            total_amount=1200.00,
            status='PROCESSING',
            delivery_address=patient.address
        )

        self.stdout.write('Seeding follow-ups & notifications & tasks...')

        # FollowUp
        FollowUp.objects.create(
            followup_id='FLW-10001',
            patient=patient,
            doctor=doctor,
            related_appointment=appointment,
            followup_date=datetime.date.today() + datetime.timedelta(days=14),
            reason='Assess long-term recovery rate post bypass.',
            status=FollowUpStatus.PENDING,
            created_by=doctor_user
        )

        # Notification
        Notification.objects.create(
            user=patient_user,
            type='APPOINTMENT_CONFIRMED',
            title='Appointment Confirmed',
            message='Your appointment with Dr. John Smith on 28 Aug has been approved.',
            is_read=False
        )

        # Coordination Tasks
        CoordinationTask.objects.create(
            task_id='TSK-10001',
            patient=patient,
            task_type=TaskType.REPORT_REVIEW,
            title=f"Review Lab Results for {patient.user.first_name}",
            description="Patient lipid profile draw is complete. Human clinical review pending.",
            priority=TaskPriority.HIGH,
            status=TaskStatus.PENDING,
            created_by=coordinator_user
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with mock clinical files!'))
