import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.apps import apps
from accounts.models import UserRole
from accounts.permissions import IsDoctorOrCoordinator, IsStaffMember
from audit_logs.utils import log_audit
from .models import CoordinationTask, TaskStatus, TaskPriority, TaskType
from .serializers import CoordinationTaskSerializer

class CoordinationTaskViewSet(viewsets.ModelViewSet):
    queryset = CoordinationTask.objects.all()
    serializer_class = CoordinationTaskSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.CARE_COORDINATOR]:
            return CoordinationTask.objects.all()
        elif user.role == UserRole.DOCTOR:
            # Doctors see tasks assigned to them or related to their patients
            return CoordinationTask.objects.filter(assigned_to=user)
        else:
            # Patients see tasks relating to them
            return CoordinationTask.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        task_id = "TSK-" + str(10000 + CoordinationTask.objects.count() + 1)
        serializer.save(task_id=task_id, created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.datetime.now()
        task.save()
        
        # Log audit
        log_audit(
            user=request.user,
            action="COMPLETE_COORDINATION_TASK",
            resource_type="COORDINATION_TASK",
            resource_id=task.id,
            patient_id=task.patient.id
        )

        return Response({"success": True, "message": "Task marked as completed."})

    @action(detail=True, methods=['post'])
    def escalate(self, request, pk=None):
        task = self.get_object()
        task.status = TaskStatus.ESCALATED
        task.priority = TaskPriority.URGENT
        task.save()
        
        # Log audit
        log_audit(
            user=request.user,
            action="ESCALATE_COORDINATION_TASK",
            resource_type="COORDINATION_TASK",
            resource_id=task.id,
            patient_id=task.patient.id
        )

        return Response({"success": True, "message": "Task escalated to urgent.", "status": task.status})


# 2. Human Review Queue ViewSet
class HumanReviewViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Human clinical actions are restricted to Doctor/Coordinators
        return [IsDoctorOrCoordinator()]

    def list(self, request):
        # List tasks requiring clinical approval: REPORT_REVIEW or REFERRAL in PENDING status
        pending_review_tasks = CoordinationTask.objects.filter(
            task_type__in=[TaskType.REPORT_REVIEW, TaskType.REFERRAL],
            status=TaskStatus.PENDING
        )
        serializer = CoordinationTaskSerializer(pending_review_tasks, many=True)
        return Response({
            "success": True,
            "count": pending_review_tasks.count(),
            "results": serializer.data
        })

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def approve(self, request, pk=None):
        task = get_object_or_404(CoordinationTask, pk=pk)
        
        if task.status != TaskStatus.PENDING:
            return Response({"success": False, "message": "This task is not in pending review state."}, status=status.HTTP_400_BAD_REQUEST)

        # Execute appropriate module approval logic based on task type
        if task.task_type == TaskType.REFERRAL:
            try:
                Referral = apps.get_model('referrals', 'Referral')
                # Find matching pending referral for this patient
                referral = Referral.objects.filter(patient=task.patient, status='REQUESTED').last()
                if referral:
                    referral.status = 'APPROVED'
                    referral.save()
            except LookupError:
                pass
        
        elif task.task_type == TaskType.REPORT_REVIEW:
            try:
                DiagnosticReport = apps.get_model('diagnostics', 'DiagnosticReport')
                report = DiagnosticReport.objects.filter(patient=task.patient, review_status='PENDING_REVIEW').last()
                if report:
                    report.review_status = 'REVIEWED'
                    report.reviewed_by = request.user
                    report.reviewed_at = datetime.datetime.now()
                    report.save()
            except LookupError:
                pass

        # Mark review task as completed
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.datetime.now()
        task.save()

        # Log audit
        log_audit(
            user=request.user,
            action="APPROVE_HUMAN_REVIEW",
            resource_type="COORDINATION_TASK",
            resource_id=task.id,
            patient_id=task.patient.id
        )

        return Response({"success": True, "message": f"Review task approved successfully. Related clinical records updated."})

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def reject(self, request, pk=None):
        task = get_object_or_404(CoordinationTask, pk=pk)
        
        if task.status != TaskStatus.PENDING:
            return Response({"success": False, "message": "This task is not in pending review state."}, status=status.HTTP_400_BAD_REQUEST)

        # Update clinical record status
        if task.task_type == TaskType.REFERRAL:
            try:
                Referral = apps.get_model('referrals', 'Referral')
                referral = Referral.objects.filter(patient=task.patient, status='REQUESTED').last()
                if referral:
                    referral.status = 'CLOSED'
                    referral.save()
            except LookupError:
                pass

        # Mark review task cancelled or completed
        task.status = TaskStatus.CANCELLED
        task.completed_at = datetime.datetime.now()
        task.save()

        # Log audit
        log_audit(
            user=request.user,
            action="REJECT_HUMAN_REVIEW",
            resource_type="COORDINATION_TASK",
            resource_id=task.id,
            patient_id=task.patient.id
        )

        return Response({"success": True, "message": "Review task rejected. Related clinical records cancelled."})
