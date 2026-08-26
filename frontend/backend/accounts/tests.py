import datetime
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import UserRole
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment, AppointmentStatus, ConsultationType
from pharmacy.models import Medicine, Prescription, PharmacyOrder, MedicineCategory

User = get_user_model()

class HealoraAPITests(APITestCase):

    def setUp(self):
        # 1. Create Patient User & Profile
        self.patient_user = User.objects.create_user(
            email='patient_test@healora.com',
            password='Password123',
            first_name='Patient',
            last_name='Test',
            role=UserRole.PATIENT
        )
        self.patient = Patient.objects.create(
            user=self.patient_user,
            patient_id='AN99',
            date_of_birth=datetime.date(1990, 1, 1),
            gender='Male',
            blood_group='O+',
            height=180.00,
            weight=75.00,
            emergency_contact='Test Contact',
            address='123 Road'
        )

        # 2. Create Second Patient (for isolation checks)
        self.other_patient_user = User.objects.create_user(
            email='other_test@healora.com',
            password='Password123',
            first_name='Other',
            last_name='Patient',
            role=UserRole.PATIENT
        )
        self.other_patient = Patient.objects.create(
            user=self.other_patient_user,
            patient_id='AN98',
            date_of_birth=datetime.date(1992, 1, 1),
            gender='Female',
            blood_group='A-',
            height=165.00,
            weight=60.00,
            emergency_contact='Other Contact',
            address='456 Road'
        )

        # 3. Create Doctor User & Profile
        self.doctor_user = User.objects.create_user(
            email='doctor_test@healora.com',
            password='Password123',
            first_name='Doctor',
            last_name='Test',
            role=UserRole.DOCTOR
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            doctor_id='D9001',
            specialization='Cardiology',
            qualification='MD',
            experience_years=10,
            hospital='Healora Center',
            department='Cardiology',
            consultation_fee=500.00,
            bio='Test Bio',
            languages='English',
            location='Los Angeles',
            rating=5.0
        )

    # --- 1. AUTHENTICATION & LOGIN TESTS ---

    def test_jwt_login_successful(self):
        url = reverse('auth_login')
        data = {
            "email": "patient_test@healora.com",
            "password": "Password123"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_jwt_login_invalid_password(self):
        url = reverse('auth_login')
        data = {
            "email": "patient_test@healora.com",
            "password": "WrongPassword"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


    # --- 2. OBJECT-LEVEL PRIVACY & AUTHORIZATION TESTS ---

    def test_patient_access_own_profile(self):
        # Authenticate as patient
        self.client.force_authenticate(user=self.patient_user)
        url = reverse('patient-detail', kwargs={'pk': self.patient.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['patient_id'], 'AN99')

    def test_patient_denied_other_patient_profile(self):
        # Authenticate as patient
        self.client.force_authenticate(user=self.patient_user)
        # Attempt to access other patient profile
        url = reverse('patient-detail', kwargs={'pk': self.other_patient.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


    # --- 3. APPOINTMENTS DOUBLE-BOOKING TESTS ---

    def test_appointment_double_booking_validation(self):
        self.client.force_authenticate(user=self.patient_user)
        
        # Create first confirmed appointment
        Appointment.objects.create(
            appointment_id='APT-TEST-1',
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=datetime.date(2026, 9, 1),
            start_time=datetime.time(10, 0),
            end_time=datetime.time(10, 30),
            status=AppointmentStatus.CONFIRMED
        )

        # Attempt to book overlapping slot (9:45 to 10:15 overlaps 10:00 to 10:30)
        url = reverse('appointment-list')
        data = {
            "patient": self.patient.id,
            "doctor": self.doctor.id,
            "appointment_date": "2026-09-01",
            "start_time": "09:45:00",
            "end_time": "10:15:00",
            "consultation_type": "ONLINE",
            "reason": "Routine Checkup"
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('doctor', response.data)


    # --- 4. PHARMACY PRESCRIPTION CHECKS ---

    def test_order_prescription_medicine_without_prescription_fails(self):
        self.client.force_authenticate(user=self.patient_user)
        
        # Create prescription required medicine
        rx_med = Medicine.objects.create(
            name='Antibiotic X',
            generic_name='Amoxicillin',
            category=MedicineCategory.ANTIBIOTICS,
            manufacturer='Labs',
            description='Test description',
            price=500.00,
            stock_quantity=10,
            prescription_required=True
        )

        # Try to create pharmacy order with no prescription attached
        url = reverse('pharmacy-order-list')
        data = {
            "patient": self.patient.id,
            "prescription": None,  # Omitted prescription
            "total_amount": "500.00",
            "delivery_address": "Test street"
        }
        
        response = self.client.post(url, data, format='json')
        # Simple schema link check: order links to prescription. If none is supplied, it can't order.
        # If we pass a prescription that doesn't exist or is invalid, it validates
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
