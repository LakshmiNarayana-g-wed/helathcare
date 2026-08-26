from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.models import UserRole
from accounts.permissions import IsDoctorOrCoordinator
from .models import Referral, ReferralStatus
from .serializers import ReferralSerializer

class ReferralViewSet(viewsets.ModelViewSet):
    queryset = Referral.objects.all()
    serializer_class = ReferralSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.CARE_COORDINATOR]:
            return Referral.objects.all()
        elif user.role == UserRole.DOCTOR:
            # Doctors can see referrals they sent or received
            return Referral.objects.filter(referring_doctor__user=user) | Referral.objects.filter(specialist__user=user)
        else:
            # Patients see their own referrals
            return Referral.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        ref_id = "REF-" + str(10000 + Referral.objects.count() + 1)
        serializer.save(referral_id=ref_id)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        referral = self.get_object()
        user = request.user
        
        # Clinical approval requires coordinator or doctors or admins (humans)
        if user.role not in [UserRole.ADMIN, UserRole.CARE_COORDINATOR]:
            return Response({
                "success": False, 
                "message": "Unauthorized. Clinical approval requires an authorized care coordinator."
            }, status=status.HTTP_403_FORBIDDEN)

        referral.status = ReferralStatus.APPROVED
        referral.save()
        return Response({"success": True, "message": "Referral approved clinically.", "status": referral.status})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        referral = self.get_object()
        user = request.user
        
        if user.role not in [UserRole.ADMIN, UserRole.CARE_COORDINATOR]:
            return Response({
                "success": False, 
                "message": "Unauthorized. Clinical rejection requires an authorized care coordinator."
            }, status=status.HTTP_403_FORBIDDEN)

        referral.status = ReferralStatus.CLOSED
        referral.notes = referral.notes or "" + "\nRejected by Care Coordinator."
        referral.save()
        return Response({"success": True, "message": "Referral rejected clinically.", "status": referral.status})
