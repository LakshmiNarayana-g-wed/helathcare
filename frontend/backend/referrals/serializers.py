from rest_framework import serializers
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer
from .models import Referral

class ReferralSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    referring_doctor_details = DoctorSerializer(source='referring_doctor', read_only=True)
    specialist_details = DoctorSerializer(source='specialist', read_only=True)

    class Meta:
        model = Referral
        fields = '__all__'
