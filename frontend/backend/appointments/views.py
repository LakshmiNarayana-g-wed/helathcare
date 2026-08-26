import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from accounts.models import UserRole
from accounts.permissions import IsStaffMember, IsDoctorOrCoordinator
from patients.models import Patient
from doctors.models import Doctor
from .models import Appointment, AppointmentStatus, ConsultationType
from .serializers import AppointmentSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.ADMIN or user.role == UserRole.CARE_COORDINATOR:
            return Appointment.objects.all()
        elif user.role == UserRole.DOCTOR:
            return Appointment.objects.filter(doctor__user=user)
        else:
            # Patient sees their own appointments
            return Appointment.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        user = self.request.user
        patient = serializer.validated_data.get('patient')

        # If user is patient, enforce they can only book for themselves
        if user.role == UserRole.PATIENT:
            patient_profile = get_object_or_404(Patient, user=user)
            if patient != patient_profile:
                raise permissions.exceptions.PermissionDenied("You can only book appointments for yourself.")

        # Generate appointment ID
        appt_id = "APT-" + str(10000 + Appointment.objects.count() + 1)
        serializer.save(appointment_id=appt_id, created_by=user)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        user = request.user
        if user.role not in [UserRole.ADMIN, UserRole.CARE_COORDINATOR, UserRole.DOCTOR]:
            return Response({"success": False, "message": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)
        
        appointment.status = AppointmentStatus.CONFIRMED
        appointment.save()
        return Response({"success": True, "message": "Appointment confirmed.", "status": appointment.status})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        user = request.user
        
        # Patients can cancel their own, doctor/staff can cancel assigned
        if user.role == UserRole.PATIENT and appointment.patient.user != user:
            return Response({"success": False, "message": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)
            
        appointment.status = AppointmentStatus.CANCELLED
        appointment.save()
        return Response({"success": True, "message": "Appointment cancelled.", "status": appointment.status})

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        appointment = self.get_object()
        new_date = request.data.get('appointment_date')
        new_start = request.data.get('start_time')
        new_end = request.data.get('end_time')

        if not new_date or not new_start or not new_end:
            return Response({"success": False, "message": "Missing date/time parameters."}, status=status.HTTP_400_BAD_REQUEST)

        # Update data and run validation check
        serializer = self.get_serializer(appointment, data={
            'appointment_date': new_date,
            'start_time': new_start,
            'end_time': new_end,
            'status': AppointmentStatus.RESCHEDULED
        }, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "message": "Appointment rescheduled successfully.", "data": serializer.data})
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # Compute available slots for a doctor on a specific date
    @action(detail=False, methods=['get'], url_path='available-slots')
    def available_slots(self, request):
        doctor_id = request.query_params.get('doctor')
        date_str = request.query_params.get('date')

        if not doctor_id or not date_str:
            return Response({"success": False, "message": "Missing doctor or date parameters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            doctor = get_object_or_404(Doctor, pk=doctor_id)
            query_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"success": False, "message": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Standard clinic timings: 9:00 AM - 1:00 PM and 3:00 PM - 6:00 PM in 30 minute increments
        morning_slots = ["09:00:00", "09:30:00", "10:00:00", "10:30:00", "11:00:00", "11:30:00", "12:00:00", "12:30:00"]
        evening_slots = ["15:00:00", "15:30:00", "16:00:00", "16:30:00", "17:00:00", "17:30:00"]
        all_slots = morning_slots + evening_slots

        # Get booked slots
        booked_appts = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=query_date,
            status__in=[AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED]
        )

        booked_start_times = [apt.start_time.strftime('%H:%M:%S') for apt in booked_appts]

        # Calculate free slots
        free_slots = [slot for slot in all_slots if slot not in booked_start_times]

        return Response({
            "success": True,
            "doctor_id": doctor.id,
            "date": date_str,
            "available_slots": free_slots
        })
