from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.apps import apps
from accounts.permissions import IsPatient, IsDoctorOrCoordinator, IsStaffMember
from accounts.models import UserRole
from .models import Patient
from .serializers import PatientSerializer, PatientCreateUpdateSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PatientCreateUpdateSerializer
        return PatientSerializer

    def get_permissions(self):
        if self.action == 'create':
            # Any authenticated user can create their own patient profile if it doesn't exist
            return [permissions.IsAuthenticated()]
        elif self.action in ['list']:
            # Only staff, doctors, or care coordinators can list all patients
            return [IsDoctorOrCoordinator()]
        else:
            # Retrieve, update, destroy, timeline, dashboard
            return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Assign current user to patient profile
        if Patient.objects.filter(user=self.request.user).exists():
            raise serializers.ValidationError("Patient profile already exists for this user.")
        # Auto generate a patient ID
        patient_id = "P" + str(1000 + Patient.objects.count() + 1)
        serializer.save(user=self.request.user, patient_id=patient_id)

    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.ADMIN or user.role == UserRole.CARE_COORDINATOR:
            return Patient.objects.all()
        elif user.role == UserRole.DOCTOR:
            # In a real app, patients assigned to doctor. Here, we return all for simulation or simplify
            return Patient.objects.all()
        else:
            # Patients can only see themselves
            return Patient.objects.filter(user=user)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        user = request.user
        # Patient can only access their own profile
        if user.role == UserRole.PATIENT and obj.user != user:
            self.permission_denied(request, message="You are not authorized to view this profile.")

    # Timeline Aggregator
    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        patient = self.get_object()
        self.check_object_permissions(request, patient)
        
        timeline_events = []

        # 1. Query Appointments (Import inside to avoid circular reference)
        try:
            Appointment = apps.get_model('appointments', 'Appointment')
            appointments = Appointment.objects.filter(patient=patient)
            for apt in appointments:
                timeline_events.append({
                    "id": f"apt-{apt.id}",
                    "type": "APPOINTMENT",
                    "date": apt.appointment_date.isoformat() if apt.appointment_date else None,
                    "title": f"Appointment with {apt.doctor.user.first_name} {apt.doctor.user.last_name}",
                    "description": f"Consultation type: {apt.consultation_type}. Reason: {apt.reason}",
                    "status": apt.status
                })
        except LookupError:
            pass

        # 2. Query Referrals
        try:
            Referral = apps.get_model('referrals', 'Referral')
            referrals = Referral.objects.filter(patient=patient)
            for ref in referrals:
                timeline_events.append({
                    "id": f"ref-{ref.id}",
                    "type": "REFERRAL",
                    "date": ref.requested_date.isoformat() if ref.requested_date else None,
                    "title": f"Referral to {ref.specialization}",
                    "description": f"Referred by Dr. {ref.referring_doctor.user.last_name}. Reason: {ref.reason}",
                    "status": ref.status
                })
        except LookupError:
            pass

        # 3. Query Diagnostics (Investigations & Reports)
        try:
            Investigation = apps.get_model('diagnostics', 'Investigation')
            investigations = Investigation.objects.filter(patient=patient)
            for inv in investigations:
                timeline_events.append({
                    "id": f"inv-{inv.id}",
                    "type": "INVESTIGATION",
                    "date": inv.scheduled_date.isoformat() if inv.scheduled_date else None,
                    "title": f"Diagnostic Test: {inv.test_name}",
                    "description": f"Diagnostic center: {inv.diagnostic_center}. Status: {inv.status}",
                    "status": inv.status
                })
        except LookupError:
            pass

        # 4. Query Prescriptions
        try:
            Prescription = apps.get_model('pharmacy', 'Prescription')
            prescriptions = Prescription.objects.filter(patient=patient)
            for pr in prescriptions:
                timeline_events.append({
                    "id": f"pres-{pr.id}",
                    "type": "PRESCRIPTION",
                    "date": pr.created_at.date().isoformat() if pr.created_at else None,
                    "title": f"Prescription: {pr.medicine.name if pr.medicine else 'Medication'}",
                    "description": f"Dosage: {pr.dosage}, Frequency: {pr.frequency}. Duration: {pr.duration}",
                    "status": "COMPLETED"
                })
        except LookupError:
            pass

        # 5. Query Pharmacy Orders
        try:
            PharmacyOrder = apps.get_model('pharmacy', 'PharmacyOrder')
            orders = PharmacyOrder.objects.filter(patient=patient)
            for ord in orders:
                timeline_events.append({
                    "id": f"order-{ord.id}",
                    "type": "PHARMACY_ORDER",
                    "date": ord.created_at.date().isoformat() if ord.created_at else None,
                    "title": f"Pharmacy Order: {ord.order_id}",
                    "description": f"Total Amount: ₹{ord.total_amount}. Delivery: {ord.delivery_address}",
                    "status": ord.status
                })
        except LookupError:
            pass

        # 6. Query FollowUps
        try:
            FollowUp = apps.get_model('followups', 'FollowUp')
            followups = FollowUp.objects.filter(patient=patient)
            for fl in followups:
                timeline_events.append({
                    "id": f"follow-{fl.id}",
                    "type": "FOLLOW_UP",
                    "date": fl.followup_date.isoformat() if fl.followup_date else None,
                    "title": f"Follow-up with Dr. {fl.doctor.user.last_name}",
                    "description": f"Reason: {fl.reason}",
                    "status": fl.status
                })
        except LookupError:
            pass

        # Sort events chronologically (newest first)
        timeline_events.sort(key=lambda x: x['date'] if x['date'] else '', reverse=True)

        return Response({
            "success": True,
            "patient_id": patient.patient_id,
            "timeline": timeline_events
        })

    # Dashboard Vitals Telemetry summary
    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        patient = self.get_object()
        self.check_object_permissions(request, patient)
        
        # Mocking telemetry values that match the front-end patient info
        return Response({
            "success": True,
            "patient": {
                "id": patient.patient_id,
                "name": f"{patient.user.first_name} {patient.user.last_name}",
                "age": patient.date_of_birth,
                "blood_group": patient.blood_group,
                "weight": patient.weight,
                "height": patient.height,
            },
            "vitals": {
                "blood_pressure": "120/70 mmHg",
                "heart_rate": "97 bpm",
                "blood_glucose": "7.9 mmol/L",
                "oxygen_saturation": "96.5%",
                "body_temperature": "98.6°F",
                "respiratory_rate": "16 bpm"
            },
            "recent_alerts": [
                {"id": 1, "type": "WARNING", "msg": "Blood Glucose is elevated (7.9 mmol/L). Monitor levels."}
            ]
        })
