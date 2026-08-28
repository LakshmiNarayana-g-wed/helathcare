from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.conf import settings
from django.views.static import serve
import os

# Simple API root view
def api_root(request):
    return JsonResponse({
        "success": True,
        "name": "Healora Healthcare Coordination API Portal",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth/",
            "patients": "/api/patients/",
            "doctors": "/api/doctors/",
            "appointments": "/api/appointments/",
            "referrals": "/api/referrals/",
            "diagnostics": "/api/diagnostics/",
            "pharmacy": "/api/pharmacy/",
            "followups": "/api/followups/",
            "notifications": "/api/notifications/",
            "coordination": "/api/coordination/",
            "ai_agent": "/api/ai/",
            "audit_logs": "/api/audit-logs/"
        }
    })

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html'), name='frontend'),
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/', api_root),
    
    # App url routing
    path('api/auth/', include('accounts.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/doctors/', include('doctors.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/referrals/', include('referrals.urls')),
    path('api/diagnostics/', include('diagnostics.urls')),
    path('api/pharmacy/', include('pharmacy.urls')),
    path('api/followups/', include('followups.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/coordination/', include('coordination.urls')),
    path('api/ai/', include('ai_agent.urls')),
    path('api/audit-logs/', include('audit_logs.urls')),
    
    # Serve root-level static assets (like doctor/medicine public images) from the dist folder
    re_path(
        r'^(?P<path>.*\.(js|css|png|jpg|jpeg|svg|gif|webp|ico))$',
        serve,
        {'document_root': os.path.join(settings.BASE_DIR, '..', 'dist')}
    ),
    
    # Catch-all route to serve the SPA index.html for frontend sub-routing (e.g. /patients, /doctors)
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]
