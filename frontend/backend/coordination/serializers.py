from rest_framework import serializers
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer
from .models import CoordinationTask

class CoordinationTaskSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = CoordinationTask
        fields = '__all__'
