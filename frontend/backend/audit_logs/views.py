from rest_framework import viewsets, permissions
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from accounts.permissions import IsAdmin
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.GenericViewSet, ListModelMixin, RetrieveModelMixin):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin] # Restricted exclusively to ADMIN role
