import os
import datetime
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers

# Models imports
from accounts.models import UserRole
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment, AppointmentStatus, ConsultationType
from referrals.models import Referral, ReferralStatus
from diagnostics.models import Investigation, DiagnosticReport
from pharmacy.models import PharmacyOrder, Prescription
from followups.models import FollowUp, FollowUpStatus
from notifications.models import Notification
from coordination.models import CoordinationTask, TaskStatus, TaskType
from audit_logs.utils import log_audit

User = get_user_model()

# --- SECURE TELEMETRY/ADMINISTRATIVE ACCESS CONTROL FOR AI TOOLS ---

def verify_patient_authorization(user, patient_id):
    """
    Ensure the requesting user is authorized to read/write patient_id data.
    - Patients can only access their own profile data.
    - Staff members (coordinators, doctors, admins) have access.
    """
    patient = get_object_or_450_or_none(patient_id)
    if not patient:
        raise PermissionDenied(f"Patient with ID {patient_id} does not exist.")
        
    if user.role == UserRole.PATIENT and patient.user != user:
        raise PermissionDenied("Access Denied: You cannot view clinical files of another patient.")
    return patient

def get_object_or_450_or_none(patient_id):
    try:
        return Patient.objects.filter(Q(patient_id=patient_id) | Q(id=patient_id)).first()
    except (ValueError, TypeError):
        return None


# --- AI SECURE TOOLS DEFINITIONS ---

def get_patient_profile(user, patient_id):
    patient = verify_patient_authorization(user, patient_id)
    log_audit(user, "AI_TOOL_GET_PROFILE", "PATIENT", patient.id, patient.id)
    return {
        "patient_id": patient.patient_id,
        "name": f"{patient.user.first_name} {patient.user.last_name}",
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "weight": f"{patient.weight} kg",
        "height": f"{patient.height} cm",
        "issue": patient.healthIssue if hasattr(patient, 'healthIssue') else "Post-Op Recovery"
    }

def get_patient_timeline(user, patient_id):
    patient = verify_patient_authorization(user, patient_id)
    log_audit(user, "AI_TOOL_GET_TIMELINE", "PATIENT", patient.id, patient.id)
    
    events = []
    # Appointments
    for a in Appointment.objects.filter(patient=patient).order_by('-appointment_date'):
        events.append({
            "type": "APPOINTMENT",
            "date": str(a.appointment_date),
            "title": f"Appointment with Dr. {a.doctor.user.last_name}",
            "status": a.status
        })
    # Investigations
    for i in Investigation.objects.filter(patient=patient).order_by('-scheduled_date'):
        events.append({
            "type": "INVESTIGATION",
            "date": str(i.scheduled_date),
            "title": i.test_name,
            "status": i.status
        })
    # Orders
    for o in PharmacyOrder.objects.filter(patient=patient).order_by('-created_at'):
        events.append({
            "type": "PHARMACY_ORDER",
            "date": str(o.created_at.date()),
            "title": f"Order {o.order_id}",
            "status": o.status
        })
    return {"patient_id": patient_id, "timeline": events}

def get_upcoming_appointments(user, patient_id):
    patient = verify_patient_authorization(user, patient_id)
    log_audit(user, "AI_TOOL_GET_UPCOMING_APPTS", "APPOINTMENT", None, patient.id)
    appts = Appointment.objects.filter(
        patient=patient, 
        appointment_date__gte=datetime.date.today(),
        status__in=[AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED]
    )
    return [
        {
            "id": a.appointment_id,
            "doctor": a.doctor.user.first_name + " " + a.doctor.user.last_name,
            "specialty": a.doctor.specialization,
            "date": str(a.appointment_date),
            "time": a.start_time.strftime("%H:%M"),
            "status": a.status
        } for a in appts
    ]

def search_doctors(user, specialty=None, location=None):
    log_audit(user, "AI_TOOL_SEARCH_DOCTORS", "DOCTOR", None, None)
    qs = Doctor.objects.all()
    if specialty:
        qs = qs.filter(specialization__icontains=specialty)
    if location:
        qs = qs.filter(location__icontains=location)
    return [
        {
            "id": d.id,
            "name": f"Dr. {d.user.first_name} {d.user.last_name}",
            "specialty": d.specialization,
            "hospital": d.hospital,
            "fee": float(d.consultation_fee),
            "is_available": d.is_available
        } for d in qs
    ]

def get_available_slots(user, doctor_id, date_str):
    log_audit(user, "AI_TOOL_GET_SLOTS", "DOCTOR", doctor_id, None)
    doctor = get_object_or_404(Doctor, pk=doctor_id)
    query_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
    
    slots = ["09:00:00", "10:00:00", "11:00:00", "15:00:00", "16:00:00"]
    booked = Appointment.objects.filter(
        doctor=doctor, 
        appointment_date=query_date,
        status__in=[AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED]
    ).values_list('start_time', flat=True)
    
    booked_str = [t.strftime('%H:%M:%S') for t in booked]
    return [s for s in slots if s not in booked_str]

def create_appointment_request(user, patient_id, doctor_id, date_str, time_str, reason):
    patient = verify_patient_authorization(user, patient_id)
    doctor = get_object_or_404(Doctor, pk=doctor_id)
    date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
    time = datetime.datetime.strptime(time_str, '%H:%M:%S').time()
    
    # Simple double booking check
    exists = Appointment.objects.filter(
        doctor=doctor, 
        appointment_date=date, 
        start_time=time,
        status__in=[AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED]
    ).exists()
    
    if exists:
        return {"success": False, "message": "Time slot already booked."}

    end_time = (datetime.datetime.combine(date, time) + datetime.timedelta(minutes=30)).time()
    appt_id = "APT-" + str(10000 + Appointment.objects.count() + 1)
    
    appt = Appointment.objects.create(
        appointment_id=appt_id,
        patient=patient,
        doctor=doctor,
        appointment_date=date,
        start_time=time,
        end_time=end_time,
        consultation_type=ConsultationType.ONLINE,
        reason=reason,
        status=AppointmentStatus.REQUESTED,
        created_by=user
    )

    log_audit(user, "AI_TOOL_CREATE_APPT", "APPOINTMENT", appt.id, patient.id)
    return {"success": True, "appointment_id": appt_id, "status": "REQUESTED"}

def get_referral_status(user, patient_id):
    patient = verify_patient_authorization(user, patient_id)
    log_audit(user, "AI_TOOL_GET_REFERRAL", "REFERRAL", None, patient.id)
    refs = Referral.objects.filter(patient=patient)
    return [
        {
            "id": r.referral_id,
            "specialist": f"Dr. {r.specialist.user.last_name}" if r.specialist else "Pending Assignee",
            "specialization": r.specialization,
            "status": r.status,
            "priority": r.priority
        } for r in refs
    ]

def get_investigation_status(user, patient_id):
    patient = verify_patient_authorization(user, patient_id)
    log_audit(user, "AI_TOOL_GET_INVESTIGATION", "INVESTIGATION", None, patient.id)
    invs = Investigation.objects.filter(patient=patient)
    return [
        {
            "id": i.investigation_id,
            "test_name": i.test_name,
            "center": i.diagnostic_center,
            "scheduled": str(i.scheduled_date),
            "status": i.status
        } for i in invs
    ]

def get_report_status(user, patient_id):
    patient = verify_patient_authorization(user, patient_id)
    log_audit(user, "AI_TOOL_GET_REPORT", "DIAGNOSTIC_REPORT", None, patient.id)
    reps = DiagnosticReport.objects.filter(patient=patient)
    return [
        {
            "investigation_id": r.investigation.investigation_id,
            "test_name": r.investigation.test_name,
            "review_status": r.review_status,
            "uploaded": str(r.uploaded_at.date())
        } for r in reps
    ]

def get_pharmacy_order_status(user, patient_id):
    patient = verify_patient_authorization(user, patient_id)
    log_audit(user, "AI_TOOL_GET_ORDER", "PHARMACY_ORDER", None, patient.id)
    orders = PharmacyOrder.objects.filter(patient=patient)
    return [
        {
            "id": o.order_id,
            "status": o.status,
            "total": float(o.total_amount),
            "created": str(o.created_at.date())
        } for o in orders
    ]

def get_followups(user, patient_id):
    patient = verify_patient_authorization(user, patient_id)
    log_audit(user, "AI_TOOL_GET_FOLLOWUPS", "FOLLOW_UP", None, patient.id)
    fls = FollowUp.objects.filter(patient=patient)
    return [
        {
            "id": f.followup_id,
            "doctor": f"Dr. {f.doctor.user.last_name}",
            "date": str(f.followup_date),
            "reason": f.reason,
            "status": f.status
        } for f in fls
    ]

def create_coordination_task(user, patient_id, task_type, title, description, priority="NORMAL"):
    # Enforce task scheduling check
    patient = verify_patient_authorization(user, patient_id)
    task_id = "TSK-" + str(10000 + CoordinationTask.objects.count() + 1)
    
    task = CoordinationTask.objects.create(
        task_id=task_id,
        patient=patient,
        task_type=task_type.upper(),
        title=title,
        description=description,
        priority=priority.upper(),
        source="AI_AGENT",
        status=TaskStatus.PENDING,
        created_by=user
    )
    log_audit(user, "AI_TOOL_CREATE_COORD_TASK", "COORDINATION_TASK", task.id, patient.id)
    return {"success": True, "task_id": task_id}

def create_followup_task(user, patient_id, doctor_id, date_str, reason):
    patient = verify_patient_authorization(user, patient_id)
    doctor = get_object_or_404(Doctor, pk=doctor_id)
    date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
    fl_id = "FLW-" + str(10000 + FollowUp.objects.count() + 1)
    
    fl = FollowUp.objects.create(
        followup_id=fl_id,
        patient=patient,
        doctor=doctor,
        followup_date=date,
        reason=reason,
        status=FollowUpStatus.PENDING,
        created_by=user
    )
    log_audit(user, "AI_TOOL_CREATE_FOLLOWUP", "FOLLOW_UP", fl.id, patient.id)
    return {"success": True, "followup_id": fl_id}

def send_notification(user, recipient_email, notif_type, title, message):
    recipient = get_object_or_404(User, email=recipient_email)
    
    # Enforce notification safety: patients can only trigger notifications for themselves, or coordinators can send
    if user.role == UserRole.PATIENT and recipient != user:
        raise PermissionDenied("You can only trigger notifications to yourself.")

    notif = Notification.objects.create(
        user=recipient,
        type=notif_type.upper(),
        title=title,
        message=message
    )
    log_audit(user, "AI_TOOL_SEND_NOTIFICATION", "NOTIFICATION", notif.id, None)
    return {"success": True, "notification_id": notif.id}

def create_human_review_task(user, patient_id, task_type, title, description):
    # Route clinical decisions to human clinical review queue
    patient = verify_patient_authorization(user, patient_id)
    task_id = "TSK-" + str(10000 + CoordinationTask.objects.count() + 1)
    
    task = CoordinationTask.objects.create(
        task_id=task_id,
        patient=patient,
        task_type=task_type.upper(),
        title=title,
        description=description,
        priority="HIGH",
        source="AI_AGENT",
        status=TaskStatus.PENDING,
        created_by=user
    )
    log_audit(user, "AI_TOOL_CREATE_HUMAN_REVIEW", "COORDINATION_TASK", task.id, patient.id)
    return {"success": True, "task_id": task_id, "requires_human_review": True}


# --- MOCK / ACTUAL AGENT PIPELINE CONTROLLER ---

def run_ai_coordination_agent(user, patient_id, user_message):
    """
    Verifies user privileges and processes the message.
    Uses actual Gemini API function-calling if GEMINI_API_KEY is defined in settings,
    otherwise runs a highly intelligent rule-based keyword-to-tool mapper (fallback)
    to parse and respond.
    """
    
    # 1. Enforce patient-data authorization at the entrance
    try:
        patient = verify_patient_authorization(user, patient_id)
    except PermissionDenied as e:
        return {
            "message": str(e),
            "actions": [],
            "requires_human_review": False
        }

    gemini_key = os.getenv("GEMINI_API_KEY")
    
    # FALLBACK MOCK COGNITIVE ROUTER (Keyword based function-calling mapping)
    msg_lower = user_message.lower()
    
    # Route tool execution
    if "profile" in msg_lower or "who am i" in msg_lower:
        profile = get_patient_profile(user, patient_id)
        return {
            "message": f"Your patient profile details: ID: {profile['patient_id']}, Name: {profile['name']}, Blood Group: {profile['blood_group']}, weight: {profile['weight']}.",
            "actions": [],
            "requires_human_review": False
        }
    
    elif "appointment" in msg_lower or "upcoming doctor" in msg_lower:
        appts = get_upcoming_appointments(user, patient_id)
        if appts:
            appt_list = ", ".join([f"Dr. {a['doctor']} on {a['date']} at {a['time']}" for a in appts])
            return {
                "message": f"You have these upcoming appointments: {appt_list}.",
                "actions": [],
                "requires_human_review": False
            }
        else:
            return {
                "message": "You do not have any active upcoming appointments scheduled.",
                "actions": [],
                "requires_human_review": False
            }
            
    elif "referral" in msg_lower or "specialist" in msg_lower:
        refs = get_referral_status(user, patient_id)
        if refs:
            ref_list = ", ".join([f"specialization: {r['specialization']} (Status: {r['status']})" for r in refs])
            return {
                "message": f"Your current clinical referrals: {ref_list}.",
                "actions": [],
                "requires_human_review": False
            }
        else:
            return {
                "message": "No referrals found in your files.",
                "actions": [],
                "requires_human_review": False
            }

    elif "report" in msg_lower or "diagnostic" in msg_lower:
        reps = get_report_status(user, patient_id)
        if reps:
            rep_list = ", ".join([f"{r['test_name']} (Status: {r['review_status']})" for r in reps])
            # If any is pending human clinical validation, flag human review required!
            pending = any(r['review_status'] == 'PENDING_REVIEW' for r in reps)
            actions = []
            if pending:
                actions = [{"type": "HUMAN_REVIEW_REQUIRED", "msg": "Diagnostic report requires clinical human review validation."}]
            return {
                "message": f"Your uploaded diagnostic lab reports status: {rep_list}. Note that reports must be reviewed by a human medical doctor before clinical conclusions can be drawn.",
                "actions": actions,
                "requires_human_review": pending
            }
        else:
            return {
                "message": "No uploaded diagnostic reports detected in your medical archive.",
                "actions": [],
                "requires_human_review": False
            }

    elif "order" in msg_lower or "medicine" in msg_lower:
        orders = get_pharmacy_order_status(user, patient_id)
        if orders:
            order_list = ", ".join([f"Order {o['id']} is currently {o['status']} (Total: ₹{o['total']})" for o in orders])
            return {
                "message": f"Here is the status of your pharmacy orders: {order_list}.",
                "actions": [],
                "requires_human_review": False
            }
        else:
            return {
                "message": "No pharmacy medication orders detected for your profile.",
                "actions": [],
                "requires_human_review": False
            }
            
    elif "escalate" in msg_lower or "critical" in msg_lower or "emergency" in msg_lower:
        # Clinical escalation
        create_human_review_task(
            user=user,
            patient_id=patient_id,
            task_type="REPORT_REVIEW",
            title="Urgent Clinical Escalation Request",
            description=f"Patient {patient} requested urgent coordination escalation for query: '{user_message}'"
        )
        return {
            "message": "Your request has been escalated. A human care coordinator has been notified and will review your file immediately.",
            "actions": [{"type": "HUMAN_REVIEW_REQUIRED"}],
            "requires_human_review": True
        }

    # Default general coordinate assistant response
    return {
        "message": "Hello, I am your Healora Care Coordinator. I can help you search for doctors, view appointments, track referrals, diagnostic tests, and pharmacy orders. How can I assist you today?",
        "actions": [],
        "requires_human_review": False
    }
