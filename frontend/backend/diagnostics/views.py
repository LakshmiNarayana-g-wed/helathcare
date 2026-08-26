import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.apps import apps
from accounts.models import UserRole
from accounts.permissions import IsDiagnosticStaff, IsDoctor, IsStaffMember
from .models import Investigation, DiagnosticReport, InvestigationStatus, ReviewStatus
from .serializers import InvestigationSerializer, DiagnosticReportSerializer

class InvestigationViewSet(viewsets.ModelViewSet):
    queryset = Investigation.objects.all()
    serializer_class = InvestigationSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.CARE_COORDINATOR, UserRole.DIAGNOSTIC_STAFF]:
            return Investigation.objects.all()
        elif user.role == UserRole.DOCTOR:
            return Investigation.objects.filter(requested_by__user=user)
        else:
            return Investigation.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        inv_id = "INV-" + str(10000 + Investigation.objects.count() + 1)
        serializer.save(investigation_id=inv_id)

    # Custom action to upload diagnostic report
    @action(detail=True, methods=['post'], url_path='upload-report')
    def upload_report(self, request, pk=None):
        investigation = self.get_object()
        user = request.user
        
        if user.role not in [UserRole.ADMIN, UserRole.DIAGNOSTIC_STAFF, UserRole.DOCTOR]:
            return Response({"success": False, "message": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

        report_file = request.FILES.get('report_file') or request.data.get('report_file')
        
        # Save DiagnosticReport record (OneToOne connection)
        report, created = DiagnosticReport.objects.update_or_create(
            investigation=investigation,
            defaults={
                'patient': investigation.patient,
                'report_file': report_file,
                'uploaded_by': user,
                'review_status': ReviewStatus.PENDING_REVIEW
            }
        )

        investigation.status = InvestigationStatus.REPORT_AVAILABLE
        investigation.save()

        # Trigger a CoordinationTask for human clinical review!
        try:
            CoordinationTask = apps.get_model('coordination', 'CoordinationTask')
            task_id = "TSK-" + str(10000 + CoordinationTask.objects.count() + 1)
            CoordinationTask.objects.create(
                task_id=task_id,
                patient=investigation.patient,
                task_type="REPORT_REVIEW",
                title=f"Review Diagnostic Report for {investigation.patient}",
                description=f"A new report for '{investigation.test_name}' has been uploaded by diagnostic staff and is pending clinical validation.",
                priority="HIGH",
                status="PENDING",
                created_by=user
            )
        except LookupError:
            pass

        return Response({
            "success": True, 
            "message": "Report uploaded. Clinical review task generated.",
            "report": DiagnosticReportSerializer(report).data
        })

    # Custom action to sign off/review report
    @action(detail=True, methods=['post'], url_path='review')
    def review(self, request, pk=None):
        investigation = self.get_object()
        user = request.user
        
        if user.role not in [UserRole.ADMIN, UserRole.DOCTOR]:
            return Response({
                "success": False, 
                "message": "Unauthorized. Diagnostic report review requires an authorized doctor."
            }, status=status.HTTP_403_FORBIDDEN)

        report = get_object_or_404(DiagnosticReport, investigation=investigation)
        review_decision = request.data.get('status', 'REVIEWED') # REVIEWED, UNDER_REVIEW
        
        report.review_status = review_decision
        report.reviewed_by = user
        report.reviewed_at = datetime.datetime.now()
        report.save()

        # Update matching CoordinationTask status
        try:
            CoordinationTask = apps.get_model('coordination', 'CoordinationTask')
            tasks = CoordinationTask.objects.filter(patient=investigation.patient, task_type="REPORT_REVIEW", status="PENDING")
            for t in tasks:
                t.status = "COMPLETED"
                t.completed_at = datetime.datetime.now()
                t.save()
        except LookupError:
            pass

        return Response({
            "success": True, 
            "message": f"Report marked as {review_decision}.",
            "report": DiagnosticReportSerializer(report).data
        })
