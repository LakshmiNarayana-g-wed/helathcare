from rest_framework.permissions import BasePermission
from .models import UserRole

class HasRole(BasePermission):
    roles = []

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role in self.roles or request.user.role == UserRole.ADMIN)
        )

class IsPatient(HasRole):
    roles = [UserRole.PATIENT]

class IsDoctor(HasRole):
    roles = [UserRole.DOCTOR]

class IsCareCoordinator(HasRole):
    roles = [UserRole.CARE_COORDINATOR]

class IsDiagnosticStaff(HasRole):
    roles = [UserRole.DIAGNOSTIC_STAFF]

class IsPharmacist(HasRole):
    roles = [UserRole.PHARMACIST]

class IsAdmin(HasRole):
    roles = [UserRole.ADMIN]

class IsDoctorOrCoordinator(HasRole):
    roles = [UserRole.DOCTOR, UserRole.CARE_COORDINATOR]

class IsStaffMember(HasRole):
    roles = [UserRole.DOCTOR, UserRole.CARE_COORDINATOR, UserRole.DIAGNOSTIC_STAFF, UserRole.PHARMACIST]
