from rest_framework import serializers
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer
from .models import Investigation, DiagnosticReport

class DiagnosticReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagnosticReport
        fields = '__all__'

class InvestigationSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    requested_by_details = DoctorSerializer(source='requested_by', read_only=True)
    report_details = DiagnosticReportSerializer(source='report', read_only=True)

    class Meta:
        model = Investigation
        fields = '__all__'
