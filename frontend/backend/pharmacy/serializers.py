from rest_framework import serializers
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer
from datetime import time
from .models import Medicine, Prescription, PharmacyOrder, MedicationReminder, ReminderPeriod

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)
    medicine_details = MedicineSerializer(source='medicine', read_only=True)

    class Meta:
        model = Prescription
        fields = '__all__'


class MedicationReminderSerializer(serializers.ModelSerializer):
    prescription_details = PrescriptionSerializer(source='prescription', read_only=True)

    class Meta:
        model = MedicationReminder
        fields = '__all__'
        read_only_fields = ('patient', 'last_sent_on', 'created_at', 'updated_at')

    def validate_phone_number(self, value):
        cleaned = value.replace(' ', '').replace('-', '')
        if cleaned.startswith('+91'):
            cleaned = cleaned[3:]
        elif cleaned.startswith('91') and len(cleaned) == 12:
            cleaned = cleaned[2:]
        if not cleaned.isdigit() or len(cleaned) != 10 or cleaned[0] not in '6789':
            raise serializers.ValidationError('Enter a valid 10-digit Indian mobile number, for example 9876543210.')
        return f'+91{cleaned}'

    def validate(self, attrs):
        period = attrs.get('period', getattr(self.instance, 'period', None))
        scheduled_time = attrs.get('scheduled_time', getattr(self.instance, 'scheduled_time', None))
        prescription = attrs.get('prescription', getattr(self.instance, 'prescription', None))
        if prescription and prescription.status != 'ACTIVE':
            raise serializers.ValidationError({'prescription': 'Only active prescriptions can have reminders.'})

        ranges = {
            ReminderPeriod.MORNING: (time(6, 0), time(11, 0)),
            ReminderPeriod.AFTERNOON: (time(12, 0), time(15, 0)),
            ReminderPeriod.EVENING: (time(19, 0), time(23, 0)),
        }
        if period in ranges and scheduled_time:
            start, end = ranges[period]
            if not start <= scheduled_time <= end:
                raise serializers.ValidationError({'scheduled_time': f'Time must be between {start:%H:%M} and {end:%H:%M} for the selected period.'})
        return attrs

class PharmacyOrderSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    prescription_details = PrescriptionSerializer(source='prescription', read_only=True)

    class Meta:
        model = PharmacyOrder
        fields = '__all__'

    def validate(self, data):
        prescription = data.get('prescription')
        patient = data.get('patient')

        # Ensure prescription belongs to this patient
        if prescription:
            if prescription.patient != patient:
                raise serializers.ValidationError({
                    "prescription": "This prescription does not belong to the selected patient."
                })
            if prescription.status != 'ACTIVE':
                raise serializers.ValidationError({
                    "prescription": "The selected prescription is no longer active."
                })
        return data
