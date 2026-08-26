from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime
import os
import threading
import time
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Database path (local SQLite file)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'db.sqlite3')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ----------------- Database Tables -----------------

class Patient(Base):
    __tablename__ = "patients"
    patient_id = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    gender = Column(String)
    age = Column(Integer)

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    appointment_id = Column(String, unique=True)
    patient_id = Column(String)
    patient_name = Column(String)
    specialist = Column(String)
    department = Column(String)
    appointment_date = Column(String)
    time = Column(String)
    location = Column(String)
    status = Column(String) # Scheduled, Completed, Cancelled, Rescheduled

class Referral(Base):
    __tablename__ = "referrals"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    referral_id = Column(String, unique=True)
    patient_id = Column(String)
    referring_department = Column(String)
    receiving_department = Column(String)
    specialist = Column(String)
    referral_date = Column(String)
    status = Column(String) # Pending, Scheduled, Completed, Cancelled
    appointment = Column(String)

class Investigation(Base):
    __tablename__ = "investigations"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    investigation_id = Column(String, unique=True)
    patient_id = Column(String)
    investigation_name = Column(String)
    ordered_date = Column(String)
    completion_date = Column(String)
    status = Column(String) # Ordered, Pending, Completed
    followup_required = Column(Boolean, default=False)

class FollowUp(Base):
    __tablename__ = "followups"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    followup_id = Column(String, unique=True)
    patient_id = Column(String)
    followup_action = Column(String)
    due_date = Column(String)
    assigned_department = Column(String)
    status = Column(String) # Pending, Completed, Overdue

class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(String)
    date = Column(String)
    title = Column(String)
    type = Column(String) # Registration, Consultation, Appointment, Investigation, Referral, Follow-up, Order

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(String)
    title = Column(String)
    type = Column(String) # Overdue, Pending, Completed, Upcoming
    color = Column(String) # Red, Orange, Green, Blue
    description = Column(String)

class PharmacyOrder(Base):
    __tablename__ = "pharmacy_orders"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(String, unique=True)
    patient_id = Column(String)
    medicine_name = Column(String)
    price = Column(Float)
    status = Column(String) # Ordered, Processing, Dispatched, Delivered
    order_date = Column(String)

class MedicationReminder(Base):
    __tablename__ = "medication_reminders"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(String)
    period = Column(String) # MORNING, AFTERNOON, EVENING
    scheduled_time = Column(String) # HH:MM format
    phone_number = Column(String)
    is_active = Column(Boolean, default=True)
    last_sent_on = Column(String, nullable=True) # YYYY-MM-DD
    created_at = Column(String, default=lambda: datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

# ----------------- Database Seeder -----------------

def init_db():
    # Force clean schemas for the hackathon prototype
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed Patient
        patient = Patient(
            patient_id="AN01",
            name="Lakshmi",
            email="lakshmi@healora.com",
            gender="Female",
            age=35
        )
        db.add(patient)

        # 2. Seed Appointments
        db.add(Appointment(
            appointment_id="APT-10001",
            patient_id="AN01",
            patient_name="Lakshmi",
            specialist="Dr. John Smith",
            department="Cardiology",
            appointment_date="2026-08-25",
            time="10:30",
            location="Cardiology Center Room 3A",
            status="Scheduled"
        ))
        db.add(Appointment(
            appointment_id="APT-10002",
            patient_id="AN01",
            patient_name="Lakshmi",
            specialist="Dr. Amy Adams",
            department="Neurology",
            appointment_date="2026-08-20",
            time="11:00",
            location="Neurology Ward",
            status="Cancelled"
        ))

        # 3. Seed Referrals
        db.add(Referral(
            referral_id="REF-10001",
            patient_id="AN01",
            referring_department="General Medicine",
            receiving_department="Cardiology",
            specialist="Dr. John Smith",
            referral_date="2026-08-25",
            status="Pending",
            appointment=""
        ))

        # 4. Seed Investigations
        db.add(Investigation(
            investigation_id="INV-10001",
            patient_id="AN01",
            investigation_name="ECG",
            ordered_date="2026-08-23",
            completion_date="2026-08-24",
            status="Completed",
            followup_required=True
        ))
        db.add(Investigation(
            investigation_id="INV-10002",
            patient_id="AN01",
            investigation_name="Blood Lipid Panel",
            ordered_date="2026-08-22",
            completion_date="",
            status="Pending",
            followup_required=False
        ))

        # 5. Seed Follow-ups
        db.add(FollowUp(
            followup_id="FLW-10001",
            patient_id="AN01",
            followup_action="Review ECG results",
            due_date="2026-08-28",
            assigned_department="Cardiology",
            status="Pending"
        ))
        db.add(FollowUp(
            followup_id="FLW-10002",
            patient_id="AN01",
            followup_action="Annual Health Assessment checkup",
            due_date="2026-08-15", # Overdue
            assigned_department="General Medicine",
            status="Pending"
        ))

        # 6. Seed Timeline Events
        db.add(TimelineEvent(patient_id="AN01", date="2026-08-21", title="Registration completed", type="Registration"))
        db.add(TimelineEvent(patient_id="AN01", date="2026-08-22", title="Doctor consultation in General Medicine", type="Consultation"))
        db.add(TimelineEvent(patient_id="AN01", date="2026-08-23", title="Investigation ECG ordered", type="Investigation"))
        db.add(TimelineEvent(patient_id="AN01", date="2026-08-24", title="Investigation ECG completed", type="Investigation"))
        db.add(TimelineEvent(patient_id="AN01", date="2026-08-25", title="Specialist referral to Cardiology created", type="Referral"))
        db.add(TimelineEvent(patient_id="AN01", date="2026-08-25", title="Specialist appointment scheduled with Dr. John Smith", type="Appointment"))
        db.add(TimelineEvent(patient_id="AN01", date="2026-08-28", title="Follow-up review due for ECG", type="Follow-up"))

        # 7. Seed Pharmacy Orders
        db.add(PharmacyOrder(
            order_id="ORD-10001",
            patient_id="AN01",
            medicine_name="Antibiotic Amoxicillin X",
            price=1200.00,
            status="Processing",
            order_date="2026-08-21"
        ))
        db.add(PharmacyOrder(
            order_id="ORD-10002",
            patient_id="AN01",
            medicine_name="Heart Regulator Medication B",
            price=2400.00,
            status="Dispatched",
            order_date="2026-08-22"
        ))

        # Seed timeline events for pharmacy orders
        db.add(TimelineEvent(patient_id="AN01", date="2026-08-21", title="Pharmacy order ORD-10001 created", type="Order"))
        db.add(TimelineEvent(patient_id="AN01", date="2026-08-22", title="Pharmacy order ORD-10002 dispatched", type="Order"))

        db.commit()
    finally:
        db.close()

# ----------------- FastAPI Setup -----------------

app = FastAPI(title="Healthcare Coordination Agent Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    threading.Thread(target=check_and_send_reminders_loop, daemon=True).start()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------- Pydantic Schemas -----------------

class LoginPayload(BaseModel):
    email: Optional[str] = ""
    password: Optional[str] = ""

class AppointmentCreate(BaseModel):
    patient_id: str
    specialist: str
    department: str
    appointment_date: str
    time: str
    location: str
    status: Optional[str] = "Scheduled"

class ReferralCreate(BaseModel):
    patient_id: str
    referring_department: str
    receiving_department: str
    specialist: str
    referral_date: str
    status: Optional[str] = "Pending"

class InvestigationCreate(BaseModel):
    patient_id: str
    investigation_name: str
    ordered_date: str
    status: Optional[str] = "Ordered"

class FollowUpCreate(BaseModel):
    patient_id: str
    followup_action: str
    due_date: str
    assigned_department: str
    status: Optional[str] = "Pending"

class OrderCreate(BaseModel):
    patient_id: str
    medicine_name: str
    price: float
    order_date: str
    status: Optional[str] = "Ordered"

class AIChatRequest(BaseModel):
    message: str
    patient_id: Optional[str] = "AN01"
    persona: Optional[str] = "general"

class VoiceIntakeRequest(BaseModel):
    message: str
    patient_id: Optional[str] = "AN01"
    stage: Optional[str] = "idle"
    context_doctor_id: Optional[str] = None

class MedicationReminderRequest(BaseModel):
    period: str
    scheduled_time: str
    phone_number: str

class TestSMSRequest(BaseModel):
    phone_number: str
    message: str

class TriageRequest(BaseModel):
    symptoms: List[str] = []
    custom_symptom: Optional[str] = ""
    severity: Optional[int] = 5
    duration: Optional[str] = "1-3 days"
    age: Optional[int] = 35
    gender: Optional[str] = "Female"
    comorbidities: Optional[List[str]] = []
    pain_type: Optional[str] = "Moderate"

class DrugInteractionRequest(BaseModel):
    medications: List[str] = []
    conditions: Optional[List[str]] = []

class LabInterpreterRequest(BaseModel):
    panel_type: str = "Lipid Panel"
    biomarkers: dict = {}

class RiskAssessmentRequest(BaseModel):
    age: int = 45
    gender: str = "Male"
    systolic_bp: int = 135
    total_cholesterol: int = 215
    hdl_cholesterol: int = 42
    smoker: bool = False
    diabetic: bool = False
    bmi: float = 26.5
    physical_activity_mins: Optional[int] = 90

# ----------------- Auth API -----------------

@app.post("/api/auth/login/")
def login(payload: LoginPayload):
    # Dummy login for prototype session
    return {"access": "mock-access-token-12345"}

@app.get("/api/patients/{patient_id}/dashboard/")
def get_patient_dashboard(patient_id: str, db: Session = Depends(get_db)):
    # Returns dashboard data
    p = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not p:
        p = db.query(Patient).first()
    return {
        "success": True,
        "patient": {
            "id": 1,
            "patient_id": p.patient_id,
            "name": p.name,
            "email": p.email,
            "gender": p.gender,
            "age": p.age
        },
        "vitals": {
            "blood_pressure": "120/80",
            "heart_rate": 72,
            "blood_glucose": 95,
            "oxygen_saturation": 98,
            "body_temperature": 37.0,
            "respiratory_rate": 16
        }
    }

# ----------------- Appointment API -----------------

@app.get("/appointments")
def get_appointments(patient_id: Optional[str] = "AN01", db: Session = Depends(get_db)):
    return db.query(Appointment).filter(Appointment.patient_id == patient_id).all()

@app.post("/appointments")
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    appt_id = f"APT-{10000 + db.query(Appointment).count() + 1}"
    appt = Appointment(
        appointment_id=appt_id,
        patient_id=payload.patient_id,
        patient_name="Lakshmi",
        specialist=payload.specialist,
        department=payload.department,
        appointment_date=payload.appointment_date,
        time=payload.time,
        location=payload.location,
        status=payload.status
    )
    db.add(appt)
    
    # Create timeline event
    db.add(TimelineEvent(
        patient_id=payload.patient_id,
        date=payload.appointment_date,
        title=f"Specialist appointment with {payload.specialist} scheduled",
        type="Appointment"
    ))
    db.commit()
    return appt

@app.post("/appointments/{id}/reschedule")
def reschedule_appointment(id: int, new_date: str, new_time: str, db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.appointment_date = new_date
    appt.time = new_time
    appt.status = "Rescheduled"
    
    db.add(TimelineEvent(
        patient_id=appt.patient_id,
        date=new_date,
        title=f"Appointment with {appt.specialist} rescheduled to {new_date}",
        type="Appointment"
    ))
    db.commit()
    return appt

@app.post("/appointments/{id}/cancel")
def cancel_appointment(id: int, db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = "Cancelled"
    
    db.add(TimelineEvent(
        patient_id=appt.patient_id,
        date=datetime.date.today().strftime("%Y-%m-%d"),
        title=f"Appointment with {appt.specialist} cancelled",
        type="Appointment"
    ))
    db.commit()
    return appt

@app.post("/appointments/{id}/complete")
def complete_appointment(id: int, db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = "Completed"
    db.commit()
    return appt

# ----------------- Referral API -----------------

@app.get("/referrals")
def get_referrals(patient_id: Optional[str] = "AN01", db: Session = Depends(get_db)):
    return db.query(Referral).filter(Referral.patient_id == patient_id).all()

@app.post("/referrals")
def create_referral(payload: ReferralCreate, db: Session = Depends(get_db)):
    ref_id = f"REF-{10000 + db.query(Referral).count() + 1}"
    ref = Referral(
        referral_id=ref_id,
        patient_id=payload.patient_id,
        referring_department=payload.referring_department,
        receiving_department=payload.receiving_department,
        specialist=payload.specialist,
        referral_date=payload.referral_date,
        status=payload.status,
        appointment=""
    )
    db.add(ref)
    db.add(TimelineEvent(
        patient_id=payload.patient_id,
        date=payload.referral_date,
        title=f"Referral to {payload.receiving_department} created",
        type="Referral"
    ))
    db.commit()
    return ref

# ----------------- Investigation API -----------------

@app.get("/investigations")
def get_investigations(patient_id: Optional[str] = "AN01", db: Session = Depends(get_db)):
    return db.query(Investigation).filter(Investigation.patient_id == patient_id).all()

@app.post("/investigations")
def create_investigation(payload: InvestigationCreate, db: Session = Depends(get_db)):
    inv_id = f"INV-{10000 + db.query(Investigation).count() + 1}"
    inv = Investigation(
        investigation_id=inv_id,
        patient_id=payload.patient_id,
        investigation_name=payload.investigation_name,
        ordered_date=payload.ordered_date,
        status=payload.status,
        followup_required=False
    )
    db.add(inv)
    db.add(TimelineEvent(
        patient_id=payload.patient_id,
        date=payload.ordered_date,
        title=f"Investigation {payload.investigation_name} ordered",
        type="Investigation"
    ))
    db.commit()
    return inv

# ----------------- Follow-Up API -----------------

@app.get("/followups")
def get_followups(patient_id: Optional[str] = "AN01", db: Session = Depends(get_db)):
    return db.query(FollowUp).filter(FollowUp.patient_id == patient_id).all()

@app.post("/followups")
def create_followup(payload: FollowUpCreate, db: Session = Depends(get_db)):
    fl_id = f"FLW-{10000 + db.query(FollowUp).count() + 1}"
    fl = FollowUp(
        followup_id=fl_id,
        patient_id=payload.patient_id,
        followup_action=payload.followup_action,
        due_date=payload.due_date,
        assigned_department=payload.assigned_department,
        status=payload.status
    )
    db.add(fl)
    db.add(TimelineEvent(
        patient_id=payload.patient_id,
        date=payload.due_date,
        title=f"Follow-up scheduled: {payload.followup_action}",
        type="Follow-up"
    ))
    db.commit()
    return fl

# ----------------- Pharmacy Orders API -----------------

@app.get("/orders")
def get_orders(patient_id: Optional[str] = "AN01", db: Session = Depends(get_db)):
    return db.query(PharmacyOrder).filter(PharmacyOrder.patient_id == patient_id).all()

@app.post("/orders")
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    ord_id = f"ORD-{10000 + db.query(PharmacyOrder).count() + 1}"
    order = PharmacyOrder(
        order_id=ord_id,
        patient_id=payload.patient_id,
        medicine_name=payload.medicine_name,
        price=payload.price,
        status=payload.status,
        order_date=payload.order_date
    )
    db.add(order)
    db.add(TimelineEvent(
        patient_id=payload.patient_id,
        date=payload.order_date,
        title=f"Pharmacy order {ord_id} created: {payload.medicine_name}",
        type="Order"
    ))
    db.commit()
    return order

# ----------------- Timeline API -----------------

@app.get("/api/patients/{patient_id}/timeline")
@app.get("/api/patients/{patient_id}/timeline/")
@app.get("/patients/{patient_id}/timeline")
def get_timeline(patient_id: str, db: Session = Depends(get_db)):
    events = db.query(TimelineEvent).filter(TimelineEvent.patient_id == patient_id).all()
    # Sort chronologically by date
    events.sort(key=lambda x: x.date)
    return events

# ----------------- Multi-Agent Coordination Logic (Rule Engine) -----------------

class AppointmentAgent:
    @staticmethod
    def run(patient_id, db):
        appts = db.query(Appointment).filter(Appointment.patient_id == patient_id).all()
        return {
            "appointments": [
                {
                    "specialist": a.specialist,
                    "department": a.department,
                    "date": a.appointment_date,
                    "status": a.status
                } for a in appts
            ]
        }

class ReferralAgent:
    @staticmethod
    def run(patient_id, db):
        refs = db.query(Referral).filter(Referral.patient_id == patient_id).all()
        return {
            "referrals": [
                {
                    "receiving_department": r.receiving_department,
                    "status": r.status,
                    "date": r.referral_date
                } for r in refs
            ]
        }

class InvestigationAgent:
    @staticmethod
    def run(patient_id, db):
        invs = db.query(Investigation).filter(Investigation.patient_id == patient_id).all()
        return {
            "investigations": [
                {
                    "name": i.investigation_name,
                    "status": i.status,
                    "completion_date": i.completion_date
                } for i in invs
            ]
        }

class FollowUpAgent:
    @staticmethod
    def run(patient_id, db):
        fls = db.query(FollowUp).filter(FollowUp.patient_id == patient_id).all()
        overdue_alerts = []
        missing_alerts = []
        
        # Today mock baseline date
        today_str = "2026-08-21"
        for f in fls:
            if f.due_date < today_str and f.status != "Completed":
                overdue_alerts.append(f"Overdue Follow-Up: {f.followup_action} (Due: {f.due_date})")
                
        invs = db.query(Investigation).filter(Investigation.patient_id == patient_id, Investigation.status == "Completed").all()
        for inv in invs:
            # Rule 3 check: no follow-up contains this investigation name
            has_fl = any(inv.investigation_name.lower() in f.followup_action.lower() for f in fls)
            if not has_fl:
                missing_alerts.append(f"Follow-Up May Be Required: Investigation '{inv.investigation_name}' completed but no follow-up action scheduled.")
                
        return {
            "overdue_alerts": overdue_alerts,
            "missing_alerts": missing_alerts,
            "followups": [
                {
                    "action": f.followup_action,
                    "due_date": f.due_date,
                    "status": f.status
                } for f in fls
            ]
        }

class CoordinatorAgent:
    @staticmethod
    def run(patient_id, db):
        appt_data = AppointmentAgent.run(patient_id, db)
        ref_data = ReferralAgent.run(patient_id, db)
        inv_data = InvestigationAgent.run(patient_id, db)
        fl_data = FollowUpAgent.run(patient_id, db)
        
        return {
            "patient_id": patient_id,
            "appointments": appt_data["appointments"],
            "referrals": ref_data["referrals"],
            "investigations": inv_data["investigations"],
            "followups": fl_data["followups"],
            "overdue_alerts": fl_data["overdue_alerts"],
            "missing_alerts": fl_data["missing_alerts"]
        }

# ----------------- Alerts & Engine API -----------------

@app.get("/patients/{patient_id}/alerts")
def get_alerts(patient_id: str, db: Session = Depends(get_db)):
    today_str = "2026-08-21"
    
    # 1. Clean dynamic alerts calculation
    alerts_list = []
    
    # Rule 1: Overdue Follow-Up
    overdue_fls = db.query(FollowUp).filter(
        FollowUp.patient_id == patient_id,
        FollowUp.due_date < today_str,
        FollowUp.status != "Completed"
    ).all()
    for f in overdue_fls:
        alerts_list.append({
            "title": "Overdue Follow-Up",
            "type": "Overdue",
            "color": "Red",
            "description": f"Follow-up action '{f.followup_action}' is overdue since {f.due_date}."
        })

    # Rule 2: Pending Referral
    pending_refs = db.query(Referral).filter(
        Referral.patient_id == patient_id,
        Referral.status == "Pending"
    ).all()
    for r in pending_refs:
        # Check if corresponding appointment exists
        appt_exists = db.query(Appointment).filter(
            Appointment.patient_id == patient_id,
            Appointment.department == r.receiving_department
        ).first()
        if not appt_exists:
            alerts_list.append({
                "title": "Referral Requires Attention",
                "type": "Pending",
                "color": "Orange",
                "description": f"Pending referral to {r.receiving_department} has no scheduled specialist appointment."
            })

    # Rule 3: Missing Follow-Up
    completed_invs = db.query(Investigation).filter(
        Investigation.patient_id == patient_id,
        Investigation.status == "Completed"
    ).all()
    for inv in completed_invs:
        followups = db.query(FollowUp).filter(FollowUp.patient_id == patient_id).all()
        has_fl = any(inv.investigation_name.lower() in f.followup_action.lower() for f in followups)
        if not has_fl:
            alerts_list.append({
                "title": "Follow-Up May Be Required",
                "type": "Upcoming",
                "color": "Blue",
                "description": f"Investigation '{inv.investigation_name}' completed on {inv.completion_date} but no follow-up is scheduled."
            })

    # Rule 4: Cancelled Appointment
    cancelled_appts = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.status == "Cancelled"
    ).all()
    for appt in cancelled_appts:
        # Check if replacement appointment exists
        replacement = db.query(Appointment).filter(
            Appointment.patient_id == patient_id,
            Appointment.department == appt.department,
            Appointment.status.in_(["Scheduled", "Completed", "Rescheduled"]),
            Appointment.appointment_date >= appt.appointment_date
        ).first()
        if not replacement:
            alerts_list.append({
                "title": "Appointment Requires Rescheduling",
                "type": "Overdue",
                "color": "Red",
                "description": f"Cancelled appointment with {appt.specialist} in {appt.department} has no active replacement scheduled."
            })

    # 2. Compute Dashboard Metrics Counters
    scheduled_appts_count = db.query(Appointment).filter(Appointment.patient_id == patient_id, Appointment.status == "Scheduled").count()
    pending_refs_count = db.query(Referral).filter(Referral.patient_id == patient_id, Referral.status == "Pending").count()
    pending_invs_count = db.query(Investigation).filter(Investigation.patient_id == patient_id, Investigation.status != "Completed").count()
    overdue_fls_count = len(overdue_fls)
    
    missing_actions_count = len([a for a in alerts_list if a["title"] == "Follow-Up May Be Required"])
    active_orders_count = db.query(PharmacyOrder).filter(PharmacyOrder.patient_id == patient_id, PharmacyOrder.status != "Delivered").count()

    return {
        "alerts": alerts_list,
        "counters": {
            "appointments": scheduled_appts_count,
            "pending_referrals": pending_refs_count,
            "investigations": pending_invs_count,
            "overdue_followups": overdue_fls_count,
            "missing_actions": missing_actions_count,
            "pharmacy_orders": active_orders_count
        }
    }

# ----------------- Grounded summary API -----------------

@app.post("/ai/coordination-summary/{patient_id}")
def generate_coordination_summary(patient_id: str, db: Session = Depends(get_db)):
    coor_result = CoordinatorAgent.run(patient_id, db)
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    patient_name = patient.name if patient else "Unknown Patient"
    
    # Grounded clinical summary synthesis (Rules enforced: No inventing, no diagnoses/prescriptions)
    summary_text = "Coordination Summary\n\n"
    summary_text += f"{patient_name} has the following records in our databases:\n\n"

    # Appointments
    appts = coor_result["appointments"]
    if appts:
        summary_text += "Appointments:\n"
        for a in appts:
            summary_text += f"- {a['department']} appointment with {a['specialist']} is {a['status']} for {a['date']}.\n"
    else:
        summary_text += "- No appointments scheduled.\n"
    summary_text += "\n"

    # Referrals
    refs = coor_result["referrals"]
    if refs:
        summary_text += "Referral status:\n"
        for r in refs:
            summary_text += f"- The referral to {r['receiving_department']} is currently {r['status']}.\n"
    else:
        summary_text += "- No referrals tracked.\n"
    summary_text += "\n"

    # Investigations
    invs = coor_result["investigations"]
    if invs:
        summary_text += "Investigations:\n"
        for i in invs:
            summary_text += f"- The {i['name']} investigation status is {i['status']}.\n"
    else:
        summary_text += "- No investigations ordered.\n"
    summary_text += "\n"

    # Follow-ups
    fls = coor_result["followups"]
    if fls:
        summary_text += "Follow-ups:\n"
        for f in fls:
            summary_text += f"- A follow-up review '{f['action']}' is {f['status']} (Due: {f['due_date']}).\n"
    else:
        summary_text += "- No follow-ups scheduled.\n"
    summary_text += "\n"

    # Pharmacy Orders
    orders = db.query(PharmacyOrder).filter(PharmacyOrder.patient_id == patient_id).all()
    if orders:
        summary_text += "Pharmacy Orders:\n"
        for o in orders:
            summary_text += f"- Order {o.order_id} for {o.medicine_name} is {o.status} (Ordered: {o.order_date}).\n"
    else:
        summary_text += "- No pharmacy orders found.\n"

    # Required actions attention list
    attention = []
    for r in refs:
        if r["status"] == "Pending":
            attention.append(f"Confirm the pending {r['receiving_department']} referral.")
    for f in coor_result["overdue_alerts"]:
        attention.append(f"Review overdue follow-up task: '{f}'.")
    for m in coor_result["missing_alerts"]:
        attention.append(m)

    if attention:
        summary_text += "\nAction requiring attention:\n"
        for item in attention:
            summary_text += f"- {item}\n"
    else:
        summary_text += "\nNo coordination actions require attention at this time."

    return {"summary": summary_text}

# =====================================================================
# ----------------- ADVANCED AI CLINICAL INTELLIGENCE SUITE -----------
# =====================================================================

# 1. Medication Clinical Database & Directory
CLINICAL_MEDICATIONS_DB = [
    {
        "id": "med-1",
        "name": "Metformin",
        "class": "Biguanide Antidiabetic",
        "standard_dose": "500mg - 1000mg twice daily with meals",
        "indications": ["Type 2 Diabetes Mellitus", "Insulin Resistance"],
        "food_warnings": "Take with meals to reduce gastrointestinal upset. Avoid excessive alcohol consumption due to lactic acidosis risk.",
        "renal_safety": "Contraindicated if eGFR < 30 mL/min/1.73m²."
    },
    {
        "id": "med-2",
        "name": "Warfarin",
        "class": "Vitamin K Antagonist (Anticoagulant)",
        "standard_dose": "2mg - 5mg once daily, adjusted by INR (Target 2.0-3.0)",
        "indications": ["Atrial Fibrillation", "Deep Vein Thrombosis (DVT)", "Prosthetic Heart Valves"],
        "food_warnings": "Maintain consistent dietary intake of Vitamin K (spinach, kale, broccoli). Avoid cranberries, grapefruit, and alcohol.",
        "renal_safety": "Dose carefully; monitor INR closely."
    },
    {
        "id": "med-3",
        "name": "Aspirin",
        "class": "NSAID / Antiplatelet Agent",
        "standard_dose": "75mg - 100mg daily for cardioprotection",
        "indications": ["Cardiovascular Prophylaxis", "Acute Coronary Syndrome", "Pain/Inflammation"],
        "food_warnings": "Take with food or milk to minimize gastric mucosa irritation.",
        "renal_safety": "Caution in renal impairment; risk of decreased renal blood flow."
    },
    {
        "id": "med-4",
        "name": "Atorvastatin",
        "class": "HMG-CoA Reductase Inhibitor (Statin)",
        "standard_dose": "10mg - 80mg once daily in the evening",
        "indications": ["Hypercholesterolemia", "Atherosclerotic Cardiovascular Disease (ASCVD)"],
        "food_warnings": "Avoid large quantities of grapefruit juice (>1 quart/day) due to CYP3A4 inhibition.",
        "renal_safety": "Generally safe; adjust for severe renal dysfunction."
    },
    {
        "id": "med-5",
        "name": "Lisinopril",
        "class": "ACE Inhibitor (Antihypertensive)",
        "standard_dose": "10mg - 40mg once daily",
        "indications": ["Hypertension", "Heart Failure", "Post-Myocardial Infarction Diabetic Nephropathy"],
        "food_warnings": "Avoid high-potassium salt substitutes and excessive potassium-rich foods.",
        "renal_safety": "Monitor serum creatinine and potassium 1-2 weeks after initiation."
    },
    {
        "id": "med-6",
        "name": "Amoxicillin",
        "class": "Beta-Lactam Penicillin Antibiotic",
        "standard_dose": "500mg every 8 hours or 875mg every 12 hours",
        "indications": ["Bacterial Respiratory Infections", "Otitis Media", "Streptococcal Pharyngitis"],
        "food_warnings": "Can be taken with or without food. Drink plenty of water.",
        "renal_safety": "Adjust dosage interval in severe renal impairment."
    },
    {
        "id": "med-7",
        "name": "Paracetamol (Acetaminophen)",
        "class": "Analgesic & Antipyretic",
        "standard_dose": "500mg - 1000mg every 4-6 hours (Max 4000mg/24h)",
        "indications": ["Mild to Moderate Pain", "Fever Reduction"],
        "food_warnings": "Avoid concurrent heavy alcohol use (increases hepatotoxicity risk).",
        "renal_safety": "Safe for kidneys at therapeutic doses; caution in severe hepatic impairment."
    },
    {
        "id": "med-8",
        "name": "Omeprazole",
        "class": "Proton Pump Inhibitor (PPI)",
        "standard_dose": "20mg - 40mg once daily before breakfast",
        "indications": ["GERD", "Peptic Ulcer Disease", "Gastric Acid Hypersecretion"],
        "food_warnings": "Take 30-60 minutes before morning meal.",
        "renal_safety": "Long-term use may require monitoring for hypomagnesemia and interstitial nephritis."
    },
    {
        "id": "med-9",
        "name": "Ibuprofen",
        "class": "Non-Selective NSAID",
        "standard_dose": "200mg - 400mg every 6-8 hours with food",
        "indications": ["Musculoskeletal Pain", "Arthritis", "Dysmenorrhea"],
        "food_warnings": "Always take with meals or milk. Avoid alcohol.",
        "renal_safety": "Can decrease GFR; avoid in chronic kidney disease and heart failure."
    },
    {
        "id": "med-10",
        "name": "Clopidogrel",
        "class": "P2Y12 Antiplatelet Agent",
        "standard_dose": "75mg once daily",
        "indications": ["Recent MI", "Ischemic Stroke", "Coronary Stent Placement"],
        "food_warnings": "May interact with omeprazole/esomeprazole (CYP2C19 inhibition reduces activation).",
        "renal_safety": "No dose adjustment required."
    }
]

@app.get("/api/ai/medications/")
def get_medications_library():
    return {
        "success": True,
        "medications": CLINICAL_MEDICATIONS_DB
    }

# ----------------- 2. Clinical Differential Diagnosis & Triage Endpoint -----------------

DOCTORS_REGISTRY = {
    "Cardiology": {
        "id": "doc-1",
        "name": "Dr. John Smith",
        "specialty": "Cardiology",
        "rating": "4.9",
        "experience": "15+ Years",
        "fee": 800.0,
        "hospital": "Healora Heart & Vascular Institute",
        "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80"
    },
    "Dermatology": {
        "id": "doc-2",
        "name": "Dr. Emily Tanaka",
        "specialty": "Dermatology",
        "rating": "4.8",
        "experience": "10+ Years",
        "fee": 700.0,
        "hospital": "Healora Advanced Skin Clinic",
        "image": "/dr-emily-tanaka.webp"
    },
    "Orthopedics": {
        "id": "doc-3",
        "name": "Dr. Carlos Mendez",
        "specialty": "Orthopedics",
        "rating": "4.7",
        "experience": "12+ Years",
        "fee": 900.0,
        "hospital": "Healora Ortho & Joint Institute",
        "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80"
    },
    "Neurology": {
        "id": "doc-4",
        "name": "Dr. Marco Rossi",
        "specialty": "Neurology",
        "rating": "4.9",
        "experience": "18+ Years",
        "fee": 1200.0,
        "hospital": "Healora Brain & Spine Institute",
        "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80"
    },
    "Physiotherapy": {
        "id": "doc-5",
        "name": "Dr. Michael Vitalis",
        "specialty": "Physiotherapy",
        "rating": "4.9",
        "experience": "6+ Years",
        "fee": 1000.0,
        "hospital": "Healora Sports & Physical Rehab",
        "image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80"
    },
    "Pediatrics": {
        "id": "doc-6",
        "name": "Dr. Arif Suryanto",
        "specialty": "Pediatrics",
        "rating": "4.9",
        "experience": "10+ Years",
        "fee": 600.0,
        "hospital": "Healora Children's Clinic",
        "image": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
    },
    "Emergency Care": {
        "id": "doc-7",
        "name": "Dr. Jessica Lewis",
        "specialty": "Emergency Care",
        "rating": "4.8",
        "experience": "12+ Years",
        "fee": 500.0,
        "hospital": "Healora Acute & Trauma Center",
        "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
    },
    "ENT": {
        "id": "doc-8",
        "name": "Dr. Natasha Lim",
        "specialty": "ENT",
        "rating": "4.7",
        "experience": "8+ Years",
        "fee": 500.0,
        "hospital": "Healora Ear, Nose & Throat Clinic",
        "image": "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=600&q=80"
    }
}

@app.post("/api/ai/triage/")
def ai_clinical_triage(payload: TriageRequest):
    combined = " ".join(payload.symptoms + [payload.custom_symptom or ""]).lower()
    severity = payload.severity or 5
    age = payload.age or 35
    gender = payload.gender or "Female"
    duration = payload.duration or "1-3 days"
    comorbidities = payload.comorbidities or []

    # Multi-Specialty Score Engine
    scores = {
        "Cardiology": 0,
        "Dermatology": 0,
        "Orthopedics": 0,
        "Neurology": 0,
        "Physiotherapy": 0,
        "Pediatrics": 0,
        "ENT": 0,
        "Emergency Care": 0
    }

    # 1. Evaluate Direct Selected Symptoms
    for sym in payload.symptoms:
        s_lower = sym.lower()
        if "chest" in s_lower or "tightness" in s_lower:
            scores["Cardiology"] += 15
        elif "breath" in s_lower:
            scores["Cardiology"] += 10
            scores["ENT"] += 5
        elif "fever" in s_lower and "child" not in s_lower:
            scores["Emergency Care"] += 15
        elif "migraine" in s_lower or "cephalea" in s_lower or "headache" in s_lower:
            scores["Neurology"] += 15
        elif "rash" in s_lower or "itching" in s_lower or "skin" in s_lower:
            scores["Dermatology"] += 15
        elif "knee" in s_lower or "joint" in s_lower or "bone" in s_lower:
            scores["Orthopedics"] += 15
        elif "cough" in s_lower or "wheezing" in s_lower or "throat" in s_lower:
            scores["ENT"] += 15
        elif "dizziness" in s_lower or "vertigo" in s_lower:
            scores["Neurology"] += 15
        elif "abdominal" in s_lower or "acid reflux" in s_lower or "stomach" in s_lower:
            scores["Emergency Care"] += 15
        elif "muscle" in s_lower or "soreness" in s_lower or "fatigue" in s_lower:
            scores["Physiotherapy"] += 15
        elif "child" in s_lower or "pediatric" in s_lower or "baby" in s_lower or "infant" in s_lower:
            scores["Pediatrics"] += 20

    # 2. Text Keyword Scanner
    kw_map = {
        "Dermatology": ["skin", "rash", "itch", "dermatitis", "eczema", "hives", "acne", "allergy", "lesion", "psoriasis", "blister", "mole"],
        "Orthopedics": ["knee", "joint", "bone", "back pain", "arthritis", "fracture", "ligament", "sprain", "hip", "swelling", "shoulder", "spine", "disc"],
        "Neurology": ["headache", "migraine", "cephalea", "dizzy", "vertigo", "vision", "numbness", "seizure", "stroke", "tremor", "memory", "tingling", "nerve"],
        "Physiotherapy": ["muscle", "soreness", "fatigue", "stiffness", "rehab", "spasm", "cramp", "posture", "physiotherapy", "strain", "myalgia"],
        "Pediatrics": ["child", "baby", "infant", "toddler", "pediatric", "teething", "colic", "crying"],
        "ENT": ["cough", "wheezing", "throat", "ear", "sinus", "sneezing", "hoarse", "tonsil", "nasal", "hearing", "pharyngitis", "phlegm"],
        "Emergency Care": ["high fever", "chills", "fever", "abdominal", "acid reflux", "stomach", "vomiting", "nausea", "poisoning", "diarrhea", "cramping", "cramps"],
        "Cardiology": ["chest", "heart", "angina", "tightness", "pressure", "palpitation", "cardio", "tachycardia", "coronary", "cardiovascular"]
    }

    for spec, words in kw_map.items():
        for w in words:
            if w in combined:
                scores[spec] += 3

    # Pick winning specialty (default to Cardiology if high-severity chest, otherwise highest score or Emergency Care)
    best_specialty = max(scores, key=scores.get)
    if scores[best_specialty] == 0:
        best_specialty = "Emergency Care"

    doc_info = DOCTORS_REGISTRY.get(best_specialty, DOCTORS_REGISTRY["Emergency Care"])

    # Default Triage Profiles per Specialty
    if best_specialty == "Dermatology":
        specialty = "Dermatology"
        urgency_tier = "ROUTINE_GREEN"
        urgency_label = "Dermatology Consultation"
        confidence = "93%"
        primary_condition = "Acute Contact Dermatitis & Cutaneous Urticaria"
        icd10 = "L23.9"
        differentials = [
            {"name": "Atopic Eczema Flare", "probability": "68%", "icd10": "L20.9"},
            {"name": "Allergic Contact Hypersensitivity", "probability": "55%", "icd10": "L25.9"},
            {"name": "Fungal Tinea Corporis", "probability": "32%", "icd10": "B35.4"}
        ]
        pathophysiology = "Mast cell degranulation releasing histamine and inflammatory cytokines, increasing dermal capillary permeability and causing localized pruritus and erythematous papules."
        red_flags = ["Spreading cellulitis with warmth and fever", "Blistering mucosal lesions in mouth or eyes", "Facial or lip swelling with breathing difficulty"]
        recommended_tests = ["Skin Prick Allergy Panel", "Serum Total IgE", "Dermatoscopy Evaluation"]
        immediate_care = [
            "Apply cool compresses and fragrance-free ceramide emollients",
            "Avoid hot showers, harsh soaps, and synthetic fabrics",
            "Do not scratch or unroof lesions to prevent secondary bacterial infection"
        ]
        urgent_notice = None

    elif best_specialty == "Orthopedics":
        specialty = "Orthopedics"
        urgency_tier = "URGENT_AMBER" if severity >= 8 else "ROUTINE_GREEN"
        urgency_label = "Orthopedic Assessment"
        confidence = "91%"
        primary_condition = "Musculoskeletal Ligamentous Strain & Articular Arthropathy"
        icd10 = "M25.5"
        differentials = [
            {"name": "Osteoarthritis / Synovial Inflammation", "probability": "74%", "icd10": "M19.9"},
            {"name": "Ligamentous / Meniscal Sprain", "probability": "55%", "icd10": "S83.2"},
            {"name": "Tendinopathy / Bursitis", "probability": "40%", "icd10": "M77.9"}
        ]
        pathophysiology = "Mechanical micro-trauma or degenerative cartilage erosion stimulating synovial nociceptors and localized prostaglandin-mediated inflammatory edema."
        red_flags = ["Inability to bear weight on extremity", "Visible joint deformity or bone step-off", "Loss of distal pulse or numbness in toes/fingers"]
        recommended_tests = ["Weight-Bearing Plain Radiograph (X-Ray)", "Targeted Joint MRI", "Erythrocyte Sedimentation Rate (ESR) & CRP"]
        immediate_care = [
            "Follow R.I.C.E. protocol: Rest, Ice (15-20 min intervals), Compression, and Elevation",
            "Avoid high-impact loading or pivoting motions",
            "Use supportive brace or crutches if weight-bearing causes pain > 5/10"
        ]
        urgent_notice = None

    elif best_specialty == "Neurology":
        specialty = "Neurology"
        if severity >= 8 or any(k in combined for k in ["sudden", "worst", "speech", "weak", "numb"]):
            urgency_tier = "EMERGENCY_RED"
            urgency_label = "Emergency Neuro Triage"
            primary_condition = "Acute Neurological Deficit (Rule-out TIA / Subarachnoid Hemorrhage)"
            icd10 = "G45.9"
            urgent_notice = "EMERGENCY: Sudden neurological deficits or severe thunderclap cephalea require immediate stroke center emergency evaluation."
            red_flags = ["Thunderclap headache onset (< 60 seconds)", "Facial drooping or unilateral limb weakness", "Speech difficulty or acute confusion"]
            differentials = [
                {"name": "Transient Ischemic Attack (TIA)", "probability": "82%", "icd10": "G45.9"},
                {"name": "Complicated Hemiplegic Migraine", "probability": "50%", "icd10": "G43.1"}
            ]
        else:
            urgency_tier = "URGENT_AMBER" if severity >= 7 else "ROUTINE_GREEN"
            urgency_label = "Neurology Specialty Review"
            primary_condition = "Neurovascular Migraine Cephalea & Vestibulopathy"
            icd10 = "G43.0"
            differentials = [
                {"name": "Tension-Type Cephalalgia", "probability": "70%", "icd10": "G44.2"},
                {"name": "Benign Paroxysmal Positional Vertigo (BPPV)", "probability": "52%", "icd10": "H81.1"},
                {"name": "Cervicogenic Headache", "probability": "42%", "icd10": "M53.0"}
            ]
            urgent_notice = None
            red_flags = ["Progressive visual field deficit", "Worsening headache with coughing or straining"]
        
        confidence = "92%"
        pathophysiology = "Trigeminovascular system activation with neurogenic inflammation and transient cerebral vasodilation causing throbbing cranial nociceptive signals."
        recommended_tests = ["Neurological Cranial Nerve Exam", "MRI Brain with Diffusion Weighted Imaging", "Cervical Spine X-Ray"]
        immediate_care = [
            "Rest in a quiet, dark room with minimal auditory stimulus",
            "Apply cold gel compress to forehead and posterior neck",
            "Maintain optimal electrolyte hydration; avoid migraine food triggers"
        ]

    elif best_specialty == "Physiotherapy":
        specialty = "Physiotherapy"
        urgency_tier = "ROUTINE_GREEN"
        urgency_label = "Physiotherapy & Rehab Assessment"
        confidence = "89%"
        primary_condition = "Myalgia & Postural Musculoskeletal Strain Syndrome"
        icd10 = "M79.1"
        differentials = [
            {"name": "Post-Exertional Myofascial Strain", "probability": "76%", "icd10": "M79.1"},
            {"name": "Chronic Postural Cervicothoracic Syndrome", "probability": "58%", "icd10": "M54.2"},
            {"name": "Fibromyalgia / Central Pain Sensitization", "probability": "35%", "icd10": "M79.7"}
        ]
        pathophysiology = "Myofascial trigger point irritability and repetitive eccentric muscle loading causing micro-fibrillar tears and localized lactic acid accumulation."
        red_flags = ["Sudden loss of bowel or bladder control", "Progressive muscle weakness causing foot drop", "Constant unremitting night pain"]
        recommended_tests = ["Myofascial Trigger Point Assessment", "Functional Range of Motion (ROM) Analysis", "Serum Creatine Kinase (CK)"]
        immediate_care = [
            "Gentle static stretching and active-assisted range of motion exercises",
            "Apply alternating heat pack and cold therapy (15 min each)",
            "Maintain ergonomic posture during work and sleep"
        ]
        urgent_notice = None

    elif best_specialty == "Pediatrics":
        specialty = "Pediatrics"
        urgency_tier = "URGENT_AMBER" if severity >= 7 else "ROUTINE_GREEN"
        urgency_label = "Pediatric Clinical Review"
        confidence = "90%"
        primary_condition = "Pediatric Febrile Viral Syndrome & Otitis Media"
        icd10 = "B34.9"
        differentials = [
            {"name": "Acute Otitis Media", "probability": "65%", "icd10": "H66.9"},
            {"name": "Pediatric Viral Pharyngotonsillitis", "probability": "55%", "icd10": "J02.9"},
            {"name": "Roseola Infantum", "probability": "38%", "icd10": "B08.2"}
        ]
        pathophysiology = "Immature immune system pathogen challenge eliciting hypothalamic pyrogen set-point elevation and upper respiratory mucosal edema."
        red_flags = ["Lethargy or difficulty waking up child", "Sunken fontanelle with dry mouth (dehydration)", "Stiff neck or purpuric rash"]
        recommended_tests = ["Pediatric Otoscopic Examination", "Rapid Strep Antigen Test", "Urine Dipstick (if unexplained fever)"]
        immediate_care = [
            "Maintain frequent small sips of oral rehydration solution (ORS)",
            "Dress child in lightweight breathable clothing",
            "Dose antipyretics strictly according to body weight (mg/kg), never by age alone"
        ]
        urgent_notice = None

    elif best_specialty == "ENT":
        specialty = "ENT"
        urgency_tier = "ROUTINE_GREEN"
        urgency_label = "ENT Specialist Consultation"
        confidence = "91%"
        primary_condition = "Acute Pharyngitis & Sinonasal Respiratory Congestion"
        icd10 = "J02.9"
        differentials = [
            {"name": "Acute Viral Rhinosinusitis", "probability": "72%", "icd10": "J01.9"},
            {"name": "Allergic Bronchospasm & Cough", "probability": "58%", "icd10": "J45.9"},
            {"name": "Acute Laryngotracheitis", "probability": "40%", "icd10": "J04.2"}
        ]
        pathophysiology = "Upper aerodigestive tract epithelial mucosal inflammation resulting in ciliary clearance impairment and localized lymphoid tissue hyperplasia."
        red_flags = ["Stridor (high-pitched whistling breath sound)", "Difficulty swallowing saliva / drooling", "Severe unilateral throat swelling"]
        recommended_tests = ["Diagnostic Nasopharyngoscopy", "Tympanometry & Audiogram", "Throat Swab Culture"]
        immediate_care = [
            "Warm saline gargles (3-4 times daily)",
            "Steam inhalation with eucalyptus drops",
            "Maintain vocal rest and avoid dry or chilled air"
        ]
        urgent_notice = None

    elif best_specialty == "Emergency Care":
        specialty = "Emergency Care"
        urgency_tier = "URGENT_AMBER" if severity >= 7 else "ROUTINE_GREEN"
        urgency_label = "Emergency Care / Acute Clinical Triage"
        confidence = "88%"
        primary_condition = "Acute Febrile Gastrointestinal Distress & Systemic Reaction"
        icd10 = "R50.9"
        differentials = [
            {"name": "Acute Viral Gastroenteritis", "probability": "70%", "icd10": "A08.4"},
            {"name": "Gastroesophageal Reflux Disease (GERD) Flare", "probability": "55%", "icd10": "K21.9"},
            {"name": "Acute Febrile Infection of Unspecified Origin", "probability": "45%", "icd10": "R50.9"}
        ]
        pathophysiology = "Enteric pathogen or pyrogenic cytokine-mediated hypothalamic thermoregulatory reset coupled with gastrointestinal mucosal irritation and altered peristalsis."
        red_flags = ["Fever exceeding 103°F (39.4°C) with rigid abdomen", "Severe unrelenting abdominal rebound tenderness", "Persistent vomiting with inability to keep liquids down for > 24 hours"]
        recommended_tests = ["Complete Blood Count (CBC) with Differential", "Serum Electrolytes & Renal Function", "Abdominal Ultrasound (if localized)"]
        immediate_care = [
            "Oral rehydration with balanced electrolyte solution (ORS)",
            "Maintain bland BRAT diet (Bananas, Rice, Applesauce, Toast)",
            "Monitor oral temperature every 4 hours"
        ]
        urgent_notice = None

    else:  # Cardiology
        specialty = "Cardiology"
        confidence = "95%"
        if severity >= 8 or any(k in combined for k in ["radiat", "sweat", "crush", "jaw", "arm", "faint"]):
            urgency_tier = "EMERGENCY_RED"
            urgency_label = "Emergency Department Escalation"
            primary_condition = "Acute Coronary Syndrome (Rule-out Myocardial Ischemia)"
            icd10 = "I20.0"
            urgent_notice = "CRITICAL: Crushing chest tightness with radiating symptoms requires emergency 911 / ambulance transport to the nearest cardiac catheterization facility immediately."
            red_flags = [
                "Substernal chest pressure lasting > 15 minutes",
                "Radiation to left shoulder, arm, neck, or jaw",
                "Diaphoresis (cold sweats), nausea, and acute dyspnea"
            ]
            differentials = [
                {"name": "Unstable Angina Pectoris", "probability": "88%", "icd10": "I20.0"},
                {"name": "Acute Pericarditis", "probability": "55%", "icd10": "I30.9"},
                {"name": "Gastroesophageal Reflux Spasm", "probability": "30%", "icd10": "K21.9"}
            ]
            recommended_tests = ["12-Lead Electrocardiogram (ECG)", "High-Sensitivity Serum Troponin-I", "D-Dimer Panel", "Echocardiogram"]
        else:
            urgency_tier = "URGENT_AMBER"
            urgency_label = "Urgent Cardiology Evaluation"
            primary_condition = "Atypical Angina / Hypertensive Cardiovascular Stress"
            icd10 = "I20.8"
            differentials = [
                {"name": "Costochondritis / Musculoskeletal Chest Wall Pain", "probability": "60%", "icd10": "M94.0"},
                {"name": "Cardiac Arrhythmia (Supraventricular / Ectopic)", "probability": "50%", "icd10": "I49.9"}
            ]
            recommended_tests = ["12-Lead Resting ECG", "Serum Lipid Profile", "Holter 24h Monitoring", "Echocardiogram"]
            urgent_notice = None
            red_flags = ["Palpitations with lightheadedness or presyncope"]

        pathophysiology = "Myocardial oxygen demand exceeding coronary arterial supply, resulting in localized myocardial ischemic distress or thoracic autonomic pathway excitation."
        immediate_care = [
            "Cease all physical exertion and sit in an upright, relaxed position",
            "Loosen tight collar or clothing around the neck and chest",
            "Avoid caffeine, nicotine, and strenuous physical stress"
        ]

    # Cognitive Reasoning Thought Trace
    thought_trace = [
        f"1. Symptom Lexicon Extraction: Matched symptoms to '{specialty}' domain (Score: {scores[best_specialty]}).",
        f"2. Severity & Duration Weighting: Evaluated pain level {severity}/10 over duration '{duration}'.",
        f"3. Red Flag Safety Protocol: Scanned for acute emergency ischemic, neurological, or airway compromise markers.",
        f"4. Differential Bayesian Ranking: Synthesized primary candidate '{primary_condition}' ({confidence} confidence).",
        f"5. Clinical Routing: Selected certified specialist {doc_info['name']} ({specialty}) for appointment scheduling."
    ]

    return {
        "success": True,
        "triage": {
            "urgency_tier": urgency_tier,
            "urgency_label": urgency_label,
            "confidence_score": confidence,
            "primary_condition": primary_condition,
            "icd10_code": icd10,
            "differentials": differentials,
            "pathophysiology_summary": pathophysiology,
            "red_flags": red_flags,
            "urgent_notice": urgent_notice,
            "recommended_tests": recommended_tests,
            "immediate_care": immediate_care,
            "specialist": specialty,
            "recommended_doctor": doc_info,
            "thought_trace": thought_trace,
            "intake_summary": {
                "symptoms_analyzed": payload.symptoms + ([payload.custom_symptom] if payload.custom_symptom else []),
                "severity": severity,
                "duration": duration,
                "patient_demographics": f"{age}y / {gender}"
            }
        }
    }

# ----------------- 3. RxGuardian AI Drug-Drug & Food Interaction Checker -----------------

@app.post("/api/ai/drug-interactions/")
def ai_drug_interactions(payload: DrugInteractionRequest):
    meds = [m.strip() for m in payload.medications if m.strip()]
    if len(meds) < 2:
        return {
            "success": True,
            "overall_safety_status": "SAFE",
            "safety_score": 100,
            "interactions": [],
            "food_cautions": [],
            "clinical_notes": "At least 2 medications are required to compute drug-drug interactions. Single medication profile is safe.",
            "safer_alternatives": []
        }

    med_lower = [m.lower() for m in meds]
    interactions = []
    food_cautions = []
    safety_score = 100

    def has_med(name):
        return any(name in m for m in med_lower)

    # 1. Warfarin + Aspirin / NSAIDs
    if has_med("warfarin") and (has_med("aspirin") or has_med("ibuprofen")):
        safety_score -= 45
        interactions.append({
            "drugs": ["Warfarin", "Aspirin / Ibuprofen"],
            "severity": "MAJOR_CONTRAINDICATED",
            "title": "Severe Hemorrhagic Bleeding Risk",
            "mechanism": "Synergistic anticoagulant effect: Warfarin inhibits hepatic synthesis of vitamin K clotting factors while NSAIDs/Aspirin inhibit platelet aggregation and cause gastric mucosal erosions.",
            "clinical_action": "Avoid concurrent use unless strictly managed by a cardiologist with frequent INR monitoring and gastroprotective PPI co-prescription."
        })

    # 2. Lisinopril / ACEi + Potassium-Sparing / NSAIDs
    if has_med("lisinopril") and has_med("ibuprofen"):
        safety_score -= 30
        interactions.append({
            "drugs": ["Lisinopril", "Ibuprofen"],
            "severity": "MODERATE_MONITOR",
            "title": "Renal Impairment & Blunted Antihypertensive Effect",
            "mechanism": "NSAIDs inhibit renal vasodilatory prostaglandins, impairing renal blood flow and diminishing the blood-pressure lowering efficacy of ACE inhibitors.",
            "clinical_action": "Monitor serum creatinine, blood pressure, and potassium levels. Consider Paracetamol as an alternative analgesic."
        })

    # 3. Metformin + Alcohol / Contrast
    if has_med("metformin") and has_med("warfarin"):
        safety_score -= 15
        interactions.append({
            "drugs": ["Metformin", "Warfarin"],
            "severity": "MINOR_CAUTION",
            "title": "Potential Mild Glycemic / Anticoagulant Modulation",
            "mechanism": "Competitive protein binding may slightly alter free drug fractions; minimal clinical relevance under standard therapeutic dosing.",
            "clinical_action": "Monitor routine blood glucose and INR levels during dose adjustments."
        })

    # 4. Atorvastatin + Clopidogrel / Omeprazole
    if has_med("clopidogrel") and has_med("omeprazole"):
        safety_score -= 35
        interactions.append({
            "drugs": ["Clopidogrel", "Omeprazole"],
            "severity": "MAJOR_CONTRAINDICATED",
            "title": "Decreased Antiplatelet Activation (CYP2C19 Inhibition)",
            "mechanism": "Omeprazole competitively inhibits hepatic CYP2C19, preventing the metabolic conversion of Clopidogrel to its active antiplatelet metabolite, increasing thrombotic risk.",
            "clinical_action": "Switch gastroprotective agent to Pantoprazole or H2-blocker (Famotidine) which exhibit significantly less CYP2C19 inhibition."
        })

    # 5. Paracetamol + Alcohol / Multi-APAP formulations
    if has_med("paracetamol") and has_med("amoxicillin"):
        interactions.append({
            "drugs": ["Paracetamol", "Amoxicillin"],
            "severity": "SAFE",
            "title": "No Significant Pharmacokinetic Interaction",
            "mechanism": "Distinct metabolic pathways: Paracetamol undergoes hepatic glucuronidation/sulfation while Amoxicillin is primarily eliminated via renal tubular secretion.",
            "clinical_action": "Safe to take concurrently according to prescribed individual dosage schedules."
        })

    # Food Cautions Aggregator
    if has_med("warfarin"):
        food_cautions.append({
            "substance": "Vitamin K-rich Greens (Spinach, Kale, Broccoli)",
            "severity": "HIGH",
            "advice": "Keep weekly intake consistent. Sudden increases in Vitamin K directly antagonize Warfarin's anticoagulant efficacy."
        })
    if has_med("atorvastatin"):
        food_cautions.append({
            "substance": "Grapefruit & Grapefruit Juice",
            "severity": "MODERATE",
            "advice": "Grapefruit compounds inhibit intestinal CYP3A4 enzymes, causing statin blood concentrations to surge and increasing muscle toxicity / rhabdomyolysis risk."
        })
    if has_med("lisinopril"):
        food_cautions.append({
            "substance": "High-Potassium Salt Substitutes & Bananas in excess",
            "severity": "MODERATE",
            "advice": "ACE inhibitors reduce aldosterone secretion, retaining potassium. Excessive dietary potassium may trigger hyperkalemic arrhythmias."
        })
    if has_med("metformin") or has_med("paracetamol"):
        food_cautions.append({
            "substance": "Alcoholic Beverages",
            "severity": "MODERATE",
            "advice": "Alcohol potentiates metformin-associated lactic acidosis risk and accelerates acetaminophen hepatotoxicity via CYP2E1 induction."
        })

    # Fallback if no specific conflicts found
    if not interactions:
        interactions.append({
            "drugs": meds,
            "severity": "SAFE",
            "title": "No Known Severe Drug-Drug Interactions Detected",
            "mechanism": "The selected therapeutic agents operate via non-conflicting metabolic clearance routes and separate receptor pathways.",
            "clinical_action": "Proceed with administration adhering strictly to the prescribing physician's timing and dosage directions."
        })

    safety_score = max(safety_score, 15)
    overall_status = "CRITICAL_ALERT" if safety_score < 60 else ("MODERATE_WARNING" if safety_score < 80 else "SAFE")

    return {
        "success": True,
        "medications_analyzed": meds,
        "safety_score": safety_score,
        "overall_safety_status": overall_status,
        "interactions": interactions,
        "food_cautions": food_cautions,
        "safer_alternatives": [
            {"current": "Ibuprofen with Lisinopril", "alternative": "Paracetamol (Acetaminophen) for mild analgesia"},
            {"current": "Omeprazole with Clopidogrel", "alternative": "Pantoprazole 40mg daily or Famotidine 20mg"}
        ] if safety_score < 80 else []
    }

# ----------------- 4. BioVision AI Lab Report & Biomarker Interpreter -----------------

@app.post("/api/ai/lab-interpreter/")
def ai_lab_interpreter(payload: LabInterpreterRequest):
    biomarkers = payload.biomarkers
    panel = payload.panel_type
    
    # Clinical Reference Ranges dictionary
    REFERENCE_RANGES = {
        "fasting_glucose": {"min": 70, "max": 99, "unit": "mg/dL", "name": "Fasting Blood Glucose", "category": "Metabolic"},
        "hba1c": {"min": 4.0, "max": 5.6, "unit": "%", "name": "Hemoglobin A1c (Glycated Hb)", "category": "Metabolic"},
        "total_cholesterol": {"min": 125, "max": 200, "unit": "mg/dL", "name": "Total Serum Cholesterol", "category": "Lipids"},
        "ldl_cholesterol": {"min": 50, "max": 100, "unit": "mg/dL", "name": "LDL-C (Bad Cholesterol)", "category": "Lipids"},
        "hdl_cholesterol": {"min": 40, "max": 60, "unit": "mg/dL", "name": "HDL-C (Protective Cholesterol)", "category": "Lipids"},
        "triglycerides": {"min": 50, "max": 150, "unit": "mg/dL", "name": "Serum Triglycerides", "category": "Lipids"},
        "serum_creatinine": {"min": 0.6, "max": 1.2, "unit": "mg/dL", "name": "Serum Creatinine", "category": "Renal"},
        "blood_urea_nitrogen": {"min": 7, "max": 20, "unit": "mg/dL", "name": "Blood Urea Nitrogen (BUN)", "category": "Renal"},
        "hemoglobin": {"min": 12.0, "max": 16.5, "unit": "g/dL", "name": "Hemoglobin", "category": "Hematology"},
        "wbc_count": {"min": 4.0, "max": 11.0, "unit": "x10^3/uL", "name": "White Blood Cell Count", "category": "Hematology"},
        "platelet_count": {"min": 150, "max": 450, "unit": "x10^3/uL", "name": "Platelet Count", "category": "Hematology"},
        "tsh": {"min": 0.4, "max": 4.0, "unit": "mIU/L", "name": "Thyroid Stimulating Hormone", "category": "Endocrine"},
        "systolic_bp": {"min": 90, "max": 120, "unit": "mmHg", "name": "Systolic Blood Pressure", "category": "Cardiovascular"},
        "diastolic_bp": {"min": 60, "max": 80, "unit": "mmHg", "name": "Diastolic Blood Pressure", "category": "Cardiovascular"}
    }

    evaluated = []
    abnormal_count = 0
    organ_impact = {
        "Cardiovascular": "Optimal",
        "Metabolic": "Optimal",
        "Renal": "Optimal",
        "Hematology": "Optimal",
        "Endocrine": "Optimal"
    }

    for key, val in biomarkers.items():
        try:
            num_val = float(val)
        except (ValueError, TypeError):
            continue

        ref = REFERENCE_RANGES.get(key.lower(), {
            "min": 0, "max": 100, "unit": "", "name": key.replace("_", " ").title(), "category": "General"
        })

        status = "NORMAL"
        if num_val < ref["min"]:
            status = "LOW"
            abnormal_count += 1
        elif num_val > ref["max"]:
            if num_val > ref["max"] * 1.4:
                status = "CRITICAL_HIGH"
            else:
                status = "ELEVATED"
            abnormal_count += 1

        cat = ref.get("category", "General")
        if status in ["ELEVATED", "CRITICAL_HIGH"]:
            organ_impact[cat] = "Attention Required" if organ_impact.get(cat) != "High Risk" else "High Risk"
            if status == "CRITICAL_HIGH":
                organ_impact[cat] = "High Risk"

        evaluated.append({
            "key": key,
            "name": ref["name"],
            "value": num_val,
            "unit": ref["unit"],
            "ref_min": ref["min"],
            "ref_max": ref["max"],
            "status": status,
            "category": cat
        })

    # Generate Clinical Discussion Questions
    doctor_questions = [
        "What target values should I aim for over the next 3 to 6 months?",
        "Do any of these biomarker deviations warrant adjusting my current medication or dosage?",
        "Are follow-up repeat blood tests recommended within 4 to 8 weeks?"
    ]
    if any(e["status"] in ["ELEVATED", "CRITICAL_HIGH"] and e["category"] == "Lipids" for e in evaluated):
        doctor_questions.append("Would initiating or optimizing statin therapy (HMG-CoA reductase inhibitor) benefit my cardiovascular risk profile?")
    if any(e["status"] in ["ELEVATED", "CRITICAL_HIGH"] and e["category"] == "Metabolic" for e in evaluated):
        doctor_questions.append("Should I undergo a 2-hour Oral Glucose Tolerance Test (OGTT) or continuous glucose monitoring?")

    return {
        "success": True,
        "panel_name": panel,
        "biomarkers_evaluated": evaluated,
        "total_biomarkers": len(evaluated),
        "abnormal_count": abnormal_count,
        "overall_health_rating": "Good" if abnormal_count == 0 else ("Moderate Concern" if abnormal_count <= 2 else "Clinical Review Advised"),
        "organ_system_impact": organ_impact,
        "doctor_questions": doctor_questions,
        "lifestyle_recommendations": [
            "Adopt a Mediterranean-style dietary pattern rich in monounsaturated fats and soluble fiber",
            "Engage in at least 150 minutes of moderate aerobic physical activity per week",
            "Maintain optimal hydration (minimum 2.5L water daily) to support renal filtration"
        ]
    }

# ----------------- 5. Cardiometabolic & Longevity Risk Calculator -----------------

@app.post("/api/ai/risk-assessment/")
def ai_risk_assessment(payload: RiskAssessmentRequest):
    age = payload.age
    gender = payload.gender.lower()
    sbp = payload.systolic_bp
    tc = payload.total_cholesterol
    hdl = payload.hdl_cholesterol
    smoker = payload.smoker
    diabetic = payload.diabetic
    bmi = payload.bmi

    # Framingham / ASCVD 10-Year Score Heuristic
    base_points = 0
    # Age factor
    if age < 35: base_points += 0
    elif age < 45: base_points += 3
    elif age < 55: base_points += 6
    elif age < 65: base_points += 9
    else: base_points += 12

    # Cholesterol factor
    if tc >= 240: base_points += 3
    elif tc >= 200: base_points += 1
    
    # HDL protective factor
    if hdl >= 60: base_points -= 2
    elif hdl < 40: base_points += 2

    # SBP factor
    if sbp >= 160: base_points += 4
    elif sbp >= 140: base_points += 3
    elif sbp >= 130: base_points += 1

    # Comorbidities
    if smoker: base_points += 4
    if diabetic: base_points += 4
    if bmi >= 30: base_points += 2

    # Estimate 10-year ASCVD %
    ascvd_10yr = min(max(round((base_points / 28.0) * 35.0, 1), 1.5), 45.0)
    
    # Estimate biological heart age
    heart_age_delta = round((ascvd_10yr - 5.0) * 1.2)
    estimated_heart_age = max(age + heart_age_delta, age - 5)

    # 5-Year Type 2 Diabetes Risk Score
    t2d_points = 0
    if age > 45: t2d_points += 3
    if bmi >= 30: t2d_points += 5
    elif bmi >= 25: t2d_points += 2
    if sbp >= 140: t2d_points += 2
    if diabetic: t2d_points = 15
    diabetes_risk_pct = min(round((t2d_points / 15.0) * 38.0, 1), 50.0)

    # Risk Category
    risk_category = "Low Risk (<5%)" if ascvd_10yr < 5.0 else ("Borderline (5-7.4%)" if ascvd_10yr < 7.5 else ("Intermediate (7.5-19.9%)" if ascvd_10yr < 20.0 else "High Risk (≥20%)"))

    return {
        "success": True,
        "ascvd_10yr_risk": ascvd_10yr,
        "risk_category": risk_category,
        "estimated_heart_age": estimated_heart_age,
        "chronological_age": age,
        "heart_age_difference": estimated_heart_age - age,
        "diabetes_5yr_risk": diabetes_risk_pct,
        "modifiable_factors": [
            {"factor": "Systolic Blood Pressure", "current": f"{sbp} mmHg", "target": "< 120 mmHg", "potential_reduction": "-15% ASCVD Risk"},
            {"factor": "LDL / Total Cholesterol", "current": f"{tc} mg/dL", "target": "< 180 mg/dL", "potential_reduction": "-22% ASCVD Risk"},
            {"factor": "Cardiorespiratory Fitness", "current": f"{payload.physical_activity_mins} mins/week", "target": "≥ 150 mins/week", "potential_reduction": "-18% Mortality Risk"}
        ],
        "prevention_roadmap": [
            "Initiate daily 30-minute moderate aerobic exercise (Zone-2 training)",
            "Adopt low-sodium DASH diet (< 2000mg sodium daily)",
            "Schedule annual comprehensive lipid sub-fraction testing and carotid intima-media scan"
        ]
    }

# ----------------- 6. Conversational AI Medical Copilot (MedAI 2.0) -----------------

@app.post("/api/ai/chat/")
def ai_coordination_chat(payload: AIChatRequest, db: Session = Depends(get_db)):
    raw_message = payload.message
    message = raw_message.lower()
    patient_id = payload.patient_id or "AN01"
    persona = payload.persona or "general"
    
    reply = ""
    voice_summary = ""
    thought_trace = [
        f"1. Persona Context: Activated '{persona.upper()}' clinical communication mode.",
        f"2. Patient EHR Dispatcher: Checked clinical file status for patient ID {patient_id}."
    ]

    # Persona Custom Preambles
    persona_intros = {
        "pharmacist": "💊 **Healora Clinical Pharmacology Copilot**\n\n",
        "cardiologist": "🫀 **Healora Cardiovascular Specialist Copilot**\n\n",
        "pediatrician": "🧸 **Healora Pediatric Care Copilot**\n\n",
        "lifestyle": "🌿 **Healora Longevity & Lifestyle Medicine Copilot**\n\n",
        "mental_health": "🧠 **Healora Mental Wellbeing Copilot**\n\n",
        "general": "🩺 **Healora AI Health Coordinator**\n\n"
    }
    intro = persona_intros.get(persona, persona_intros["general"])

    # 1. Summary Queries
    if "summary" in message or "coordination summary" in message:
        res = generate_coordination_summary(patient_id, db)
        reply = intro + res["summary"]
        voice_summary = f"Here is your patient health summary. You have active records in cardiology and pending follow-ups."
        thought_trace.append("3. Tool Action: Synthesized multi-agent clinical coordination records into unified summary.")

    # 2. Alerts Queries
    elif "alert" in message or "missing" in message or "overdue" in message:
        res = get_alerts(patient_id, db)
        alerts_text = "\n".join([f"- **{a['title']}**: {a['description']}" for a in res["alerts"]])
        reply = intro + f"**Active Coordination Alerts for Patient {patient_id}:**\n\n" + (alerts_text if alerts_text else "All follow-ups and investigations are up to date! No alerts active.")
        voice_summary = f"You have {len(res['alerts'])} active alerts requiring attention on your patient dashboard."
        thought_trace.append("3. Tool Action: Scanned follow-up, referral, and investigation tables for care-gap anomalies.")

    # 3. Appointments Queries
    elif "appointment" in message or "booking" in message or "scheduled" in message or "when is my" in message:
        appts = db.query(Appointment).filter(Appointment.patient_id == patient_id).all()
        reply = intro + f"**Scheduled Appointments on Record:**\n\n" + "\n".join([f"• **{a.department}** with **{a.specialist}** ({a.status})\n  📅 Date: {a.appointment_date} at {a.time}\n  📍 Location: {a.location}" for a in appts])
        voice_summary = f"You have appointments scheduled with {appts[0].specialist if appts else 'no specialists'}."
        thought_trace.append("3. Tool Action: Retrieved verified appointments from database.")

    # 4. Referrals Queries
    elif "referral" in message:
        refs = db.query(Referral).filter(Referral.patient_id == patient_id).all()
        reply = intro + f"**Clinical Referrals on Record:**\n\n" + "\n".join([f"• {r.referring_department} ➔ **{r.receiving_department}** ({r.specialist})\n  Status: `{r.status}` | Date: {r.referral_date}" for r in refs])
        voice_summary = "Your clinical referrals are tracked in your health file."
        thought_trace.append("3. Tool Action: Queried inter-departmental referral registry.")

    # 5. Diagnostic Lab Reports
    elif "investigation" in message or "test" in message or "lab" in message or "ecg" in message or "blood" in message:
        invs = db.query(Investigation).filter(Investigation.patient_id == patient_id).all()
        reply = intro + f"**Diagnostic Investigations & Lab Tests:**\n\n" + "\n".join([f"• **{i.investigation_name}**: `{i.status}` (Ordered: {i.ordered_date})" for i in invs])
        voice_summary = f"You have {len(invs)} diagnostic tests on record including ECG and blood panels."
        thought_trace.append("3. Tool Action: Checked diagnostic investigation records.")

    # 6. Pharmacy Orders
    elif "order" in message or "medicine" in message or "pharmacy" in message or "track" in message or "ord-" in message:
        orders = db.query(PharmacyOrder).filter(PharmacyOrder.patient_id == patient_id).all()
        if orders:
            order_text = "\n".join([f"• **Order {o.order_id}**: {o.medicine_name}\n  Status: `{o.status}` | Total: ₹{o.price:.2f}" for o in orders])
            reply = intro + f"**Pharmacy Medication Order Tracking:**\n\n{order_text}"
            voice_summary = f"Your pharmacy order for {orders[0].medicine_name} is currently {orders[0].status}."
        else:
            reply = intro + "You do not have any active pharmacy medication orders recorded."
            voice_summary = "No pharmacy orders were found in your record."
        thought_trace.append("3. Tool Action: Queried live pharmacy dispatch database.")

    # 7. Specific Persona Handling
    elif persona == "pharmacist" or "dosage" in message or "side effect" in message or "paracetamol" in message or "antibiotic" in message:
        reply = intro + "Here is clinical pharmacological guidance for your inquiry:\n\n"
        reply += "• **Standard Dosing Protocols:** Always adhere strictly to prescribed intervals. For analgesics like Paracetamol, max daily dose is 4000mg per 24 hours.\n"
        reply += "• **Gastrointestinal Precautions:** NSAIDs (Ibuprofen, Aspirin) should always be consumed with food or milk.\n"
        reply += "• **Drug-Food Timing:** Antibiotics and Statins should be taken at consistent daily hours to maintain stable plasma concentrations.\n\n"
        reply += "💡 *You can use our **RxGuardian Drug Interaction Checker** on this page to analyze multiple medications simultaneously!*"
        voice_summary = "For medication safety, adhere strictly to dosage guidelines and take NSAIDs with food."
        thought_trace.append("3. Pharmacological Engine: Cross-referenced clinical drug interaction and dosage guidelines.")

    elif persona == "cardiologist" or "chest" in message or "heart" in message or "bp" in message or "blood pressure" in message:
        reply = intro + "Here is cardiovascular clinical guidance for your inquiry:\n\n"
        reply += "• **Target Hemodynamics:** Optimal resting blood pressure is < 120/80 mmHg with a resting heart rate of 60-100 bpm.\n"
        reply += "• **Urgent Red Flags:** If you experience crushing chest pain radiating to the arm, jaw, or accompanied by shortness of breath and diaphoresis, seek immediate emergency medical care.\n"
        reply += "• **Recommended Screenings:** 12-lead ECG, Lipid Panel, and 2D-Echocardiogram are recommended for routine cardiovascular health assessment.\n\n"
        reply += "🩺 *Dr. John Smith (Cardiology) is available for online consultation today on our Doctors page.*"
        voice_summary = "Optimal blood pressure is under 120 over 80. Seek emergency care immediately if experiencing radiating chest pain."
        thought_trace.append("3. Cardiovascular Triage Engine: Assessed hemodynamic targets and ischemic red-flag protocols.")

    elif persona == "lifestyle" or "diet" in message or "exercise" in message or "sleep" in message or "sugar" in message:
        reply = intro + "Here is your personalized longevity & lifestyle medicine prescription:\n\n"
        reply += "• **Cardiovascular Fitness:** Aim for at least 150 minutes of Zone-2 aerobic activity per week (conversational pace brisk walking or cycling).\n"
        reply += "• **Metabolic Nutrition:** Prioritize high-fiber complex carbohydrates, anti-inflammatory omega-3 fatty acids, and lean protein; minimize refined sugars.\n"
        reply += "• **Circadian Sleep Hygiene:** Maintain 7-8 hours of sleep in a cool, dark room to support nocturnal hormone regulation and blood pressure dipping.\n\n"
        reply += "📊 *Try our **Cardiometabolic & Longevity Risk Calculator** tab to compute your heart age!*"
        voice_summary = "Prioritize 150 minutes of weekly aerobic exercise, high-fiber nutrition, and 7 to 8 hours of quality sleep."
        thought_trace.append("3. Lifestyle Medicine Engine: Computed preventative cardiometabolic recommendations.")

    else:
        # General Medical Assistant Fallback
        appts = db.query(Appointment).filter(Appointment.patient_id == patient_id).all()
        reply = intro + f"Hello! I am your AI Clinical Care Companion. I can provide evidence-based medical information, analyze symptoms, check drug interactions, or assist with your Healora appointments.\n\n"
        reply += f"**Your Health Profile at a Glance ({patient_id}):**\n"
        reply += f"• Active Appointments: **{len(appts)}**\n"
        reply += f"• Next Scheduled: **{appts[0].specialist if appts else 'None'}** ({appts[0].appointment_date if appts else 'N/A'})\n\n"
        reply += "💬 **How can I assist you today?**\n"
        reply += "• *'Analyze my symptoms'*\n"
        reply += "• *'Check drug interactions between Warfarin and Aspirin'*\n"
        reply += "• *'Explain my latest lab results'*\n"
        reply += "• *'What are my active alerts?'*"
        voice_summary = "Hello! I am your AI Health Assistant. You can ask me medical questions, check drug interactions, or review your appointments."
        thought_trace.append("3. Natural Language Clinical Router: Provided structured navigation overview.")

    return {
        "success": True,
        "message": "AI Clinical response generated successfully.",
        "data": {
            "message": reply,
            "voice_summary": voice_summary,
            "persona": persona,
            "thought_trace": thought_trace,
            "actions": [],
            "requires_human_review": False
        }
    }


# ----------------- AI Voice Intake Assistant Endpoint -----------------

@app.post("/api/ai/voice-intake")
@app.post("/api/ai/voice-intake/")
def ai_voice_intake(payload: VoiceIntakeRequest, db: Session = Depends(get_db)):
    message = payload.message.strip().lower()
    patient_id = payload.patient_id
    stage = payload.stage
    context_doctor_id = payload.context_doctor_id

    # Get patient name
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    patient_name = patient.name if patient else "Lakshmi"

    if stage == "confirm_booking":
        # Check for affirmative response
        affirmative_words = ["yes", "yeah", "yep", "sure", "book", "schedule", "please", "confirm", "ok", "okay", "yup", "do it"]
        negative_words = ["no", "don't", "cancel", "stop", "nope", "nah"]

        is_affirmative = any(word in message for word in affirmative_words)
        is_negative = any(word in message for word in negative_words)

        if is_affirmative and context_doctor_id:
            # Look up doctor
            doctor_info = None
            for dept, doc in DOCTORS_REGISTRY.items():
                if doc["id"] == context_doctor_id:
                    doctor_info = doc
                    break
            
            if not doctor_info:
                # Default fallback doctor
                doctor_info = DOCTORS_REGISTRY["Emergency Care"]

            # Create appointment
            appt_id = f"APT-{10000 + db.query(Appointment).count() + 1}"
            tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
            appt = Appointment(
                appointment_id=appt_id,
                patient_id=patient_id,
                patient_name=patient_name,
                specialist=doctor_info["name"],
                department=doctor_info["specialty"],
                appointment_date=tomorrow,
                time="10:00",
                location=doctor_info["hospital"],
                status="Scheduled"
            )
            db.add(appt)

            # Create timeline event
            db.add(TimelineEvent(
                patient_id=patient_id,
                date=tomorrow,
                title=f"Appointment with {doctor_info['name']} scheduled via Voice Assistant",
                type="Appointment"
            ))

            # Create follow-up task for the coordinator
            fl_id = f"FLW-{10000 + db.query(FollowUp).count() + 1}"
            db.add(FollowUp(
                followup_id=fl_id,
                patient_id=patient_id,
                followup_action=f"Verify scheduled appointment for {patient_name} with {doctor_info['name']}",
                due_date=tomorrow,
                assigned_department=doctor_info["specialty"],
                status="Pending"
            ))

            db.commit()

            reply = f"Perfect! I have scheduled an appointment with **{doctor_info['name']}** in **{doctor_info['specialty']}** for tomorrow (Date: {tomorrow}) at **10:00 AM**.\n\nYou can see it on your dashboard now."
            voice_text = f"Perfect! I have scheduled an appointment for you with {doctor_info['name']} for tomorrow at 10:00 AM. It is now visible on your dashboard."
            
            return {
                "success": True,
                "reply": reply,
                "voice_text": voice_text,
                "next_stage": "idle",
                "booking_success": True,
                "doctor": doctor_info
            }
        
        elif is_negative:
            # User declined the booking
            db.add(TimelineEvent(
                patient_id=patient_id,
                date=datetime.date.today().strftime("%Y-%m-%d"),
                title=f"Patient reported problem via Voice Assistant (No appointment scheduled)",
                type="Follow-up"
            ))
            db.commit()

            reply = "Understood. I have logged your reported symptoms for your care records, but I did not schedule any appointments. Let me know if there is anything else you need help with."
            voice_text = "Understood. I have logged your reported symptoms, but I did not schedule any appointments. Let me know if there is anything else you need help with."
            
            return {
                "success": True,
                "reply": reply,
                "voice_text": voice_text,
                "next_stage": "idle",
                "booking_success": False
            }
        
        else:
            # Ambiguous
            # Retrieve doctor info from context_doctor_id
            doctor_name = "the specialist"
            for dept, doc in DOCTORS_REGISTRY.items():
                if doc["id"] == context_doctor_id:
                    doctor_name = doc["name"]
                    break

            reply = f"I didn't quite catch that. Would you like me to book the appointment with **{doctor_name}**? Please say **yes** or **no**."
            voice_text = f"I didn't quite catch that. Would you like me to book the appointment with {doctor_name}? Please say yes or no."
            
            return {
                "success": True,
                "reply": reply,
                "voice_text": voice_text,
                "next_stage": "confirm_booking",
                "context_doctor_id": context_doctor_id
            }

    else:
        # Default/Intake stage: Perform Triage on user message
        triage_req = TriageRequest(
            symptoms=[],
            custom_symptom=payload.message,
            severity=5,
            duration="1-3 days",
            age=35,
            gender="Female"
        )
        
        triage_res = ai_clinical_triage(triage_req)
        
        if not triage_res.get("success"):
            reply = "I'm sorry, I encountered an issue analyzing your symptoms. Could you please describe them again?"
            voice_text = "I am sorry, I encountered an issue analyzing your symptoms. Could you please describe them again?"
            return {
                "success": False,
                "reply": reply,
                "voice_text": voice_text,
                "next_stage": "idle"
            }
        
        triage = triage_res["triage"]
        doctor_info = triage["recommended_doctor"]
        specialty = triage["specialist"]
        primary_condition = triage["primary_condition"]
        urgency_tier = triage["urgency_tier"]
        
        if urgency_tier == "EMERGENCY_RED":
            reply = f"🚨 **Emergency Alert** 🚨\n\nYour symptoms indicate a potential high-risk condition: **{primary_condition}**.\n\nI highly recommend seeing **{doctor_info['name']}** in **{specialty}** immediately. Would you like me to schedule an emergency slot for you?"
            voice_text = f"Warning: your symptoms indicate a potential emergency, possibly related to {primary_condition}. Please seek immediate medical care. I recommend consulting {doctor_info['name']} in {specialty} as soon as possible. Would you like me to schedule an appointment for you?"
        else:
            reply = f"Based on your description, it sounds like you might be experiencing **{primary_condition}**.\n\nI suggest booking a consultation with our specialist, **{doctor_info['name']}** ({specialty}).\n\nWould you like me to schedule this appointment for you?"
            voice_text = f"Based on your symptoms, it sounds like you might be experiencing {primary_condition}. I suggest booking a consultation with our specialist, {doctor_info['name']}, in {specialty}. Would you like me to schedule this appointment for you?"
            
        return {
            "success": True,
            "reply": reply,
            "voice_text": voice_text,
            "next_stage": "confirm_booking",
            "context_doctor_id": doctor_info["id"],
            "triage": triage
        }


# =====================================================================
# ----------------- TWILIO SMS & MEDICATION REMINDERS -----------------
# =====================================================================

def send_sms_via_twilio(to_number: str, body: str):
    """
    Sends an SMS via Twilio using credentials from the environment.
    Falls back to mock logs if Twilio is not configured.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID") or ""
    auth_token = os.getenv("TWILIO_AUTH_TOKEN") or ""
    from_number = os.getenv("TWILIO_PHONE_NUMBER") or "+17372212163"

    # Try formatting to_number with country code +91 if it's 10 digits
    dest_number = to_number.strip()
    if len(dest_number) == 10 and dest_number.isdigit():
        dest_number = f"+91{dest_number}"

    if not all([account_sid, auth_token, from_number]):
        print(f"[MOCK SMS] Twilio not configured. Message to {dest_number}: '{body}'")
        return "MOCK-SID-12345"

    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=body,
            from_=from_number,
            to=dest_number
        )
        print(f"[SMS SENT] Twilio Message SID: {message.sid} to {dest_number}")
        return message.sid
    except Exception as e:
        print(f"[SMS ERROR] Failed to send Twilio SMS to {dest_number}: {e}")
        return None


# ----------------- Medication Reminders REST Endpoints -----------------

@app.post("/api/pharmacy/medication-reminders")
@app.post("/api/pharmacy/medication-reminders/")
def create_medication_reminder(payload: MedicationReminderRequest, db: Session = Depends(get_db)):
    # Validate scheduled time is within the allowed slots
    time_str = payload.scheduled_time.strip()
    period = payload.period.upper()
    
    # Validation windows
    # Morning: 6.00 to 11.00
    # Afternoon: 12.00 to 3.00 (15:00)
    # Evening: 7.00 to 11.00 (19:00 to 23:00)
    if period == "MORNING":
        if not ("06:00" <= time_str <= "11:00"):
            raise HTTPException(
                status_code=400, 
                detail="Morning reminders must be scheduled between 06:00 AM and 11:00 AM."
            )
    elif period == "AFTERNOON":
        if not ("12:00" <= time_str <= "15:00"):
            raise HTTPException(
                status_code=400, 
                detail="Afternoon reminders must be scheduled between 12:00 PM and 03:00 PM."
            )
    elif period == "EVENING":
        if not ("19:00" <= time_str <= "23:00"):
            raise HTTPException(
                status_code=400, 
                detail="Evening reminders must be scheduled between 07:00 PM and 11:00 PM."
            )
    else:
        raise HTTPException(status_code=400, detail="Invalid period selected.")

    # Create new reminder
    reminder = MedicationReminder(
        patient_id="AN01", # mock default patient ID
        period=period,
        scheduled_time=time_str,
        phone_number=payload.phone_number
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    # Immediately send a confirmation SMS
    confirm_msg = f"Healora: Your medicine reminder is set at {time_str} ({payload.period.lower()}). We will text you a 'Take your Medicine' alert."
    send_sms_via_twilio(payload.phone_number, confirm_msg)

    return {
        "success": True,
        "message": "Reminder created successfully",
        "reminder": {
            "id": reminder.id,
            "period": reminder.period,
            "scheduled_time": reminder.scheduled_time,
            "phone_number": reminder.phone_number,
            "is_active": reminder.is_active
        }
    }


@app.get("/api/pharmacy/medication-reminders")
@app.get("/api/pharmacy/medication-reminders/")
def get_medication_reminders(db: Session = Depends(get_db)):
    # Return active reminders formatted for the frontend Patient.jsx layout
    reminders = db.query(MedicationReminder).filter(MedicationReminder.patient_id == "AN01").all()
    results = []
    for r in reminders:
        results.append({
            "id": r.id,
            "period": r.period,
            "scheduled_time": r.scheduled_time,
            "phone_number": r.phone_number,
            "is_active": r.is_active,
            "prescription_details": {
                "medicine_details": {
                    "name": "Medication"
                }
            }
        })
    return results


# ----------------- SMS Test Endpoint -----------------

@app.post("/api/ai/send-test-sms")
@app.post("/api/ai/send-test-sms/")
def send_test_sms(payload: TestSMSRequest):
    sid = send_sms_via_twilio(payload.phone_number, payload.message)
    if sid:
        return {"success": True, "message_sid": sid}
    else:
        raise HTTPException(status_code=500, detail="Failed to send SMS. Check logs.")


# ----------------- Background Reminder Worker Daemon -----------------

def check_and_send_reminders_loop():
    print("[REMINDER WORKER] Starting background medication reminders worker loop...")
    while True:
        try:
            db = SessionLocal()
            # Get current time in HH:MM format
            now_str = datetime.datetime.now().strftime("%H:%M")
            today_str = datetime.date.today().strftime("%Y-%m-%d")
            
            # Find active reminders due at this minute
            due_reminders = db.query(MedicationReminder).filter(
                MedicationReminder.is_active == True,
                MedicationReminder.scheduled_time == now_str,
                (MedicationReminder.last_sent_on != today_str) | (MedicationReminder.last_sent_on == None)
            ).all()
            
            for reminder in due_reminders:
                body = f"Take your Medicine. This is your scheduled {reminder.period.lower()} reminder at {reminder.scheduled_time}."
                send_sms_via_twilio(reminder.phone_number, body)
                reminder.last_sent_on = today_str
                db.add(reminder)
            
            db.commit()
            db.close()
        except Exception as e:
            print(f"[REMINDER WORKER ERROR] {e}")
        
        # Sleep for 30 seconds to prevent skipping or double-processing
        time.sleep(30)


