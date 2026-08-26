from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from accounts.models import UserRole
from accounts.permissions import IsDoctor, IsAdmin
from .models import Doctor
from .serializers import DoctorSerializer, DoctorCreateUpdateSerializer

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DoctorCreateUpdateSerializer
        return DoctorSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only Doctor themselves or Admin can edit profile
            return [permissions.IsAuthenticated()]
        else:
            # List & Retrieve are public/authenticated
            return [permissions.AllowAny()]

    def perform_create(self, serializer):
        if Doctor.objects.filter(user=self.request.user).exists():
            raise serializers.ValidationError("Doctor profile already exists for this user.")
        doctor_id = "D" + str(2000 + Doctor.objects.count() + 1)
        serializer.save(user=self.request.user, doctor_id=doctor_id)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if self.action in ['update', 'partial_update', 'destroy']:
            if request.user.role != UserRole.ADMIN and obj.user != request.user:
                self.permission_denied(request, message="You are not authorized to edit this doctor profile.")

    def get_queryset(self):
        queryset = Doctor.objects.all()
        
        # Filtering parameters
        specialization = self.request.query_params.get('specialization')
        location = self.request.query_params.get('location')
        hospital = self.request.query_params.get('hospital')
        availability = self.request.query_params.get('availability')
        experience = self.request.query_params.get('experience')
        rating = self.request.query_params.get('rating')

        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if hospital:
            queryset = queryset.filter(hospital__icontains=hospital)
        if availability:
            queryset = queryset.filter(is_available=(availability.lower() in ['true', 'available', '1']))
        if experience:
            try:
                exp_years = int(experience.replace('+', ''))
                queryset = queryset.filter(experience_years__gte=exp_years)
            except ValueError:
                pass
        if rating:
            try:
                min_rating = float(rating)
                queryset = queryset.filter(rating__gte=min_rating)
            except ValueError:
                pass

        return queryset
