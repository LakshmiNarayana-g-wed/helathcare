from rest_framework import serializers
from django.db.models import Q
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('appointment_id', 'created_by', 'status')

    def validate(self, data):
        doctor = data.get('doctor')
        date = data.get('appointment_date')
        start = data.get('start_time')
        end = data.get('end_time')

        if not doctor or not date or not start or not end:
            return data

        if start >= end:
            raise serializers.ValidationError("Start time must be strictly before end time.")

        # Overlapping check
        overlapping = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=date,
            status__in=['REQUESTED', 'CONFIRMED', 'RESCHEDULED']
        ).filter(
            Q(start_time__lt=end, end_time__gt=start)
        )

        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)

        if overlapping.exists():
            raise serializers.ValidationError({
                "doctor": "The selected doctor has an overlapping appointment slot during this time."
            })

        return data
