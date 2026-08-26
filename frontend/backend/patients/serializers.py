from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Patient
        fields = '__all__'

class PatientCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ('date_of_birth', 'gender', 'blood_group', 'height', 'weight', 'emergency_contact', 'address')
