from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.models import UserRole
from accounts.permissions import IsDoctorOrCoordinator
from .models import FollowUp, FollowUpStatus
from .serializers import FollowUpSerializer

class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.all()
    serializer_class = FollowUpSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.CARE_COORDINATOR]:
            return FollowUp.objects.all()
        elif user.role == UserRole.DOCTOR:
            return FollowUp.objects.filter(doctor__user=user)
        else:
            return FollowUp.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        # Auto generate follow up id
        fl_id = "FLW-" + str(10000 + FollowUp.objects.count() + 1)
        serializer.save(followup_id=fl_id, created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        followup = self.get_object()
        user = request.user
        if user.role not in [UserRole.ADMIN, UserRole.CARE_COORDINATOR, UserRole.DOCTOR]:
            return Response({"success": False, "message": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

        followup.status = FollowUpStatus.COMPLETED
        followup.save()
        return Response({"success": True, "message": "Follow-up marked as completed."})
