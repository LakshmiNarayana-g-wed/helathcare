from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .agent_services import run_ai_coordination_agent

class AIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        patient_id = request.data.get('patient_id')

        if not message or not patient_id:
            return Response({
                "success": False,
                "message": "Missing required fields 'message' or 'patient_id'.",
                "error_code": "VALIDATION_ERROR"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Execute secure agent pipeline
            result = run_ai_coordination_agent(request.user, patient_id, message)
            return Response({
                "success": True,
                "message": "AI Coordination response generated successfully.",
                "data": result
            })
        except PermissionDenied as e:
            return Response({
                "success": False,
                "message": str(e),
                "error_code": "PERMISSION_DENIED"
            }, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({
                "success": False,
                "message": "An error occurred during AI processing.",
                "error_code": "AI_SERVICE_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
