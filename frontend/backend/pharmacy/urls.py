from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicineViewSet, PrescriptionViewSet, PharmacyOrderViewSet, MedicationReminderViewSet

router = DefaultRouter()
router.register(r'medicines', MedicineViewSet, basename='medicine')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')
router.register(r'orders', PharmacyOrderViewSet, basename='pharmacy-order')
router.register(r'medication-reminders', MedicationReminderViewSet, basename='medication-reminder')

urlpatterns = [
    path('', include(router.urls)),
]
