# Healora Healthcare Platform

Healora is a full-stack healthcare platform for patient care coordination. It provides a React patient portal alongside a Django REST backend for accounts, appointments, prescriptions, referrals, diagnostics, notifications, and AI-assisted clinical triage.

## Key Features

- **Doctor discovery and booking:** Browse specialists, view profiles, select appointment slots, and book online or in-person consultations.
- **Patient dashboard:** View care information, upcoming consultations, prescriptions, reports, and medication reminders.
- **AI clinical assistant:** Symptom triage, drug-interaction guidance, lab-report interpretation, risk assessment, and healthcare questions.
- **Care coordination:** Referrals, follow-ups, diagnostics, pharmacy workflows, and notifications.
- **Secure roles:** Patient, doctor, care coordinator, diagnostic staff, pharmacist, and administrator access controls.
- **Specialist profiles:** Cardiology, Dermatology, Orthopedics, Neurology, Physiotherapy, Pediatrics, Emergency Care, and ENT.

## Technology Stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS, Recharts, Lucide icons
- **Backend:** Django, Django REST Framework, JWT authentication
- **Background services:** Celery and Redis (optional for scheduled jobs)
- **Integrations:** Gemini AI and Twilio SMS through environment variables
- **Database:** SQLite by default; PostgreSQL can be configured through `DATABASE_URL`

## Project Structure

```text
healthcare/
|-- frontend/                         # React + Vite application
|   |-- public/                       # Profile images and other public assets
|   |-- src/
|   |   |-- components/               # Shared UI components
|   |   |-- data/                     # Demo doctor, medicine, and patient data
|   |   |-- pages/                    # Application pages
|   |   `-- utils/                    # Client-side helpers
|   |-- package.json
|   `-- vite.config.js
|
|-- frontend/backend/                 # Django REST backend
|   |-- accounts/                     # Users, roles, authentication
|   |-- appointments/                 # Appointment workflows
|   |-- doctors/                      # Doctor profiles
|   |-- patients/                     # Patient records
|   |-- pharmacy/                     # Prescriptions and reminders
|   |-- diagnostics/                  # Investigations and reports
|   |-- referrals/                    # Clinical referrals
|   |-- coordination/                 # Care tasks and follow-ups
|   |-- notifications/                # Notifications
|   |-- ai_agent/                     # AI-assisted services
|   |-- config/                       # Django settings and routes
|   |-- manage.py
|   `-- requirements.txt
|
`-- static/                           # Additional static assets
```

## Run Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server is available at the URL shown in the terminal, normally `http://localhost:5173`.

Create a production build with:

```bash
npm run build
```

### Backend

```bash
cd frontend/backend
python -m venv venv
```

Activate the environment:

```bash
# Windows PowerShell
venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate
```

Install dependencies, configure local settings, and start Django:

```bash
pip install -r requirements.txt
copy .env.example .env              # Windows
# cp .env.example .env              # macOS/Linux
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000/`.

## Configuration

Create `frontend/backend/.env` from `.env.example`. Keep real values out of Git. Optional integrations include:

- `GEMINI_API_KEY` for AI-powered services
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` for SMS reminders
- `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` for background tasks
- `DATABASE_URL` for PostgreSQL instead of SQLite

## Useful Commands

| Task | Command |
| --- | --- |
| Start frontend | `cd frontend && npm run dev` |
| Build frontend | `cd frontend && npm run build` |
| Lint frontend | `cd frontend && npm run lint` |
| Run backend | `cd frontend/backend && python manage.py runserver` |
| Apply migrations | `cd frontend/backend && python manage.py migrate` |
| Seed demo data | `cd frontend/backend && python manage.py seed_data` |

## Notes

- Local SQLite databases, virtual environments, frontend dependencies, and build output are intentionally excluded from version control.
- This project includes demo and mock healthcare data. Do not use it as a substitute for clinical advice or production medical workflows without appropriate security, privacy, and regulatory review.
