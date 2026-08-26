from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Doctor

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Doctor
        fields = '__all__'

class DoctorCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = (
            'specialization', 'qualification', 'experience_years', 'hospital', 
            'department', 'consultation_fee', 'bio', 'languages', 'location', 
            'is_available'
        )
