from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from accounts.models import UserRole
from accounts.permissions import IsPharmacist, IsDoctorOrCoordinator, IsStaffMember
from patients.models import Patient
from .models import Medicine, Prescription, PharmacyOrder, StockStatus, MedicationReminder
from .serializers import MedicineSerializer, PrescriptionSerializer, PharmacyOrderSerializer, MedicationReminderSerializer

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPharmacist()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Medicine.objects.all()
        category = self.request.query_params.get('category')
        availability = self.request.query_params.get('availability')
        search = self.request.query_params.get('search')

        if category and category != 'All':
            queryset = queryset.filter(category=category.upper())
        if availability:
            if availability == 'In Stock':
                queryset = queryset.filter(stock_quantity__gt=0)
            elif availability == 'Out of Stock':
                queryset = queryset.filter(stock_quantity=0)
            elif availability == 'Low Stock':
                queryset = queryset.filter(stock_quantity__gt=0, stock_quantity__lte=10)
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(generic_name__icontains=search)
        
        return queryset

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.CARE_COORDINATOR]:
            return Prescription.objects.all()
        elif user.role == UserRole.DOCTOR:
            return Prescription.objects.filter(doctor__user=user)
        else:
            return Prescription.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        # Only doctors can write a prescription (enforced by permission or here)
        if self.request.user.role != UserRole.DOCTOR:
            raise permissions.exceptions.PermissionDenied("Only certified medical doctors can issue prescriptions.")
        
        presc_id = "PRC-" + str(10000 + Prescription.objects.count() + 1)
        serializer.save(prescription_id=presc_id)


class MedicationReminderViewSet(viewsets.ModelViewSet):
    serializer_class = MedicationReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.CARE_COORDINATOR]:
            return MedicationReminder.objects.select_related('prescription__medicine', 'patient__user')
        if user.role == UserRole.PATIENT:
            return MedicationReminder.objects.filter(patient__user=user).select_related('prescription__medicine')
        return MedicationReminder.objects.none()

    def perform_create(self, serializer):
        patient = get_object_or_404(Patient, user=self.request.user)
        prescription = serializer.validated_data.get('prescription')
        if prescription and prescription.patient_id != patient.id:
            raise permissions.exceptions.PermissionDenied('You can only schedule reminders for your own prescriptions.')
        serializer.save(patient=patient, message='Take your medicine')

class PharmacyOrderViewSet(viewsets.ModelViewSet):
    queryset = PharmacyOrder.objects.all()
    serializer_class = PharmacyOrderSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.CARE_COORDINATOR, UserRole.PHARMACIST]:
            return PharmacyOrder.objects.all()
        else:
            return PharmacyOrder.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        order_id = "ORD-" + str(10000 + PharmacyOrder.objects.count() + 1)
        serializer.save(order_id=order_id)
