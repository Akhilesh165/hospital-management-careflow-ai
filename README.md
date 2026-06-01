CareFlow AI — Hospital Management System
Intelligent. Real-time. Life-saving.
A full-stack hospital management platform powered by Mamdani Fuzzy Logic AI for automated patient triage, smart bed allocation, and real-time clinical decision support.
<br/>
<div align="center">

<img src="https://img.shields.io/badge/CareFlow_AI-Hospital_Management-06b6d4?style=for-the-badge&logo=heart&logoColor=white" alt="CareFlow AI" />

# 🏥 CareFlow AI — Hospital Management System

### *Intelligent. Real-time. Life-saving.*

A **full-stack hospital management platform** powered by **Mamdani Fuzzy Logic AI** for automated patient triage, smart bed allocation, and real-time clinical decision support.

<br/>

[![React](https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Live Demo Credentials](#-live-demo-credentials)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [AI Engine — Fuzzy Logic Triage](#-ai-engine--fuzzy-logic-triage)
- [Modules Breakdown](#-modules-breakdown)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

## 🌟 Overview

**CareFlow AI** is a production-ready, multi-role hospital management system that brings clinical intelligence to the browser. Unlike traditional CRUD-based hospital apps, CareFlow AI integrates a **custom-built Fuzzy Logic inference engine** (written from scratch in Python/NumPy) to evaluate patient vitals in real time and generate medically-guided triage scores, urgency categories, and bed allocation recommendations.

The system is designed for:

- **Emergency rooms** — where rapid, accurate prioritization saves lives
- **Hospital administrators** — needing live oversight of bed occupancy and patient status
- **Doctors** — who require triage history, vitals, and appointment context in one view
- **Receptionists** — handling patient registration and appointment scheduling

> **No AI APIs, no external ML models.** The triage intelligence is a hand-crafted Mamdani Fuzzy Inference System built entirely with NumPy, following clinical triage guidelines.

---

## 🔑 Live Demo Credentials

The system auto-seeds sample data on first launch. Use these accounts to explore all roles:

| Role | Username | Password |
|---|---|---|
| 🛡️ Admin | `admin` | `admin123` |
| 🩺 Doctor | `doctor` | `doctor123` |
| 📋 Receptionist | `reception` | `reception123` |

> **Note:** If MongoDB is not running, the system automatically falls back to an **in-memory database** — no setup required for a full demo.

---

## ✨ Key Features

### 🤖 AI-Powered Smart Triage
- Custom **Mamdani Fuzzy Logic Engine** with 10 clinical inference rules
- Inputs: Heart Rate, SpO2, Temperature, Symptom Severity (1–10)
- Outputs: Triage Score (0–100), Category (Stable / Normal / Urgent / Critical), Clinical Recommendation
- Full **membership degree breakdown** displayed per assessment

### 🛏️ Intelligent Bed Allocation
- Risk Index calculator using triage score, age, comorbidities, and vitals
- Recommends: ICU, HDU, General Ward, or Outpatient
- Explains rationale behind each bed assignment

### 👥 Patient Management (CRUD)
- Full patient registration with blood group, comorbidities, allergies, emergency contacts
- Auto-generated unique Patient IDs (e.g., `PAT-8802`)
- Triage history timeline per patient
- Role-based delete permissions (Admin only)

### 📅 Appointment Booking
- Schedule appointments by patient, doctor, date, time slot, and reason
- Status tracking: Pending / Completed / Cancelled
- Triage-linked appointments — priority score visible at booking

### 📊 Real-Time Dashboard
- Live stats: Active Patients, ICU Count, HDU Count, Pending Appointments
- Bed occupancy bars for ICU / HDU / Ward
- Critical patient priority list with triage scores
- Database status indicator (MongoDB or In-Memory)
- **Auto-refreshes every 30 seconds**

### 🔐 Authentication & Role-Based Access
- JWT-based authentication (7-day token expiry)
- bcryptjs password hashing
- Role guard on delete actions (Admin-only)
- Persistent login via localStorage

### 🔄 Dual Database Mode
- Connects to **MongoDB** if available
- Falls back to **in-memory store** automatically with no data loss during session

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  ┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │Dashboard │ │  Patients  │ │ Appointments │ │  Triage UI  │  │
│  └────┬─────┘ └─────┬──────┘ └──────┬───────┘ └──────┬──────┘  │
│       └─────────────┴───────────────┴────────────────┘          │
│                          axios HTTP                              │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST API
┌──────────────────────────────▼──────────────────────────────────┐
│               BACKEND — Node.js / Express (Port 5000)           │
│  ┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │ /api/auth│ │/api/patient│ │ /api/appts   │ │ /api/health │  │
│  └──────────┘ └─────┬──────┘ └──────────────┘ └─────────────┘  │
│                     │ (triage route proxies to Python)          │
│  ┌──────────────────▼──────────────────────────────────────┐    │
│  │               MongoDB / In-Memory Fallback              │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP proxy /api/triage
┌──────────────────────────────▼──────────────────────────────────┐
│           AI MICROSERVICE — FastAPI / Python (Port 8001)        │
│  ┌──────────────────────┐   ┌──────────────────────────────┐    │
│  │  FuzzyTriageEngine   │   │      BedPredictor            │    │
│  │  (Mamdani FIS)       │   │  (Risk Index Calculator)     │    │
│  │  • Fuzzification     │   │  • Age Risk                  │    │
│  │  • Rule Evaluation   │   │  • Comorbidity Risk          │    │
│  │  • Aggregation       │   │  • Triage Score Weighting    │    │
│  │  • Defuzzification   │   │  • Bed Type Decision         │    │
│  └──────────────────────┘   └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, Axios | SPA with component-based UI |
| **UI Icons** | Lucide React | Consistent icon library |
| **Styling** | Custom CSS (CSS Variables) | Dark glassmorphism theme |
| **API Gateway** | Node.js + Express | REST API, JWT auth, data routes |
| **Database** | MongoDB + Mongoose | Persistent patient/appointment storage |
| **Fallback DB** | In-Memory (Node global) | Zero-config demo mode |
| **Auth** | JWT + bcryptjs | Secure role-based sessions |
| **AI Engine** | Python + FastAPI + NumPy | Fuzzy Logic triage microservice |
| **Validation** | Pydantic v2 | Request schema validation |
| **Build** | Vite 4 | Fast bundling and HMR |

---

## 🧠 AI Engine — Fuzzy Logic Triage

CareFlow AI's triage engine is a **hand-crafted Mamdani Fuzzy Inference System** — not a black-box neural network. Every clinical decision is fully explainable and traceable.

### Input Variables & Membership Functions

| Variable | Range | Fuzzy Sets |
|---|---|---|
| **Heart Rate** | 40 – 180 BPM | Low, Normal, High |
| **SpO2** | 70 – 100% | Critical, Borderline, Normal |
| **Temperature** | 95 – 108°F | Low, Normal, High |
| **Symptom Severity** | 1 – 10 | Mild, Moderate, Severe |

### Inference Rules (10 Clinical Rules)

```
R1:  IF SpO2 is Critical                                → Triage is CRITICAL
R2:  IF SpO2 is Borderline AND Severity is Severe       → Triage is CRITICAL
R3:  IF HR is High AND Temp is High AND Severity Severe → Triage is CRITICAL
R4:  IF SpO2 Normal AND Temp Normal AND Severity Mild   → Triage is STABLE
R5:  IF SpO2 Normal AND Temp Normal AND Severity Mod    → Triage is NORMAL
R6:  IF SpO2 Normal AND (Temp|HR abnormal) AND Mod      → Triage is URGENT
R7:  IF SpO2 Borderline AND Severity is Moderate        → Triage is URGENT
R8:  IF Temp is High AND Severity is Severe             → Triage is URGENT
R9:  IF SpO2 Borderline AND Temp is High                → Triage is CRITICAL
R10: IF HR is High AND SpO2 is Borderline               → Triage is CRITICAL
```

### Output Categories

| Score Range | Category | Action |
|---|---|---|
| 75 – 100 | 🔴 **Critical** | Immediate ICU / Code Red |
| 50 – 74 | 🟠 **Urgent** | Fast-track within 15 minutes |
| 25 – 49 | 🟡 **Normal** | Consult within 1–2 hours |
| 0 – 24 | 🟢 **Stable** | Outpatient / Home recovery |

Defuzzification uses the **Centroid Method** over 101 discretized output points for maximum precision.

---

## 📦 Modules Breakdown

### 1. Dashboard (`DashboardView.jsx`)
Real-time hospital overview with live metrics, bed occupancy visualization, critical patient alerts, and appointment queue summary. Auto-polls the API every 30 seconds.

### 2. Patient Management (`PatientManagement.jsx`)
Full CRUD for patient records. Includes search, patient detail cards, triage history timeline, and an add-patient modal with medical profile fields (blood group, comorbidities, allergies, emergency contact).

### 3. Appointment Booker (`AppointmentBooker.jsx`)
Schedule, view, update, and cancel appointments. Appointments are linked to triage scores for clinical context. Supports doctor assignment, time slots, and status management.

### 4. Triage System (`TriageSystem.jsx`)
Interactive AI triage console. Select a patient, enter vitals with sliders/inputs, run the fuzzy engine, and view the resulting score, category, recommendation, and bed allocation — all in one panel.

### 5. Auth System (`LoginView.jsx` + `auth.js`)
Secure JWT login with role-based session management. Roles: `admin`, `doctor`, `receptionist`. Token stored in localStorage, verified on every API request via Express middleware.

### 6. Python AI Microservice (`main.py`, `fuzzy_triage.py`, `bed_predictor.py`)
Standalone FastAPI service that exposes two endpoints: `/api/triage` for fuzzy inference and `/api/bed-recommendation` for bed allocation logic. Entirely stateless and independently deployable.

---

## 📁 Project Structure

```
hospital-management-careflow-ai/
│
├── frontend/                        # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardView.jsx    # Live hospital overview
│   │   │   ├── PatientManagement.jsx# Patient CRUD + triage history
│   │   │   ├── AppointmentBooker.jsx# Appointment scheduling
│   │   │   ├── TriageSystem.jsx     # AI triage console
│   │   │   ├── LoginView.jsx        # Authentication UI
│   │   │   └── Sidebar.jsx          # Navigation
│   │   ├── styles/
│   │   │   └── index.css            # Dark glassmorphism theme
│   │   ├── App.jsx                  # Root component + auth state
│   │   └── main.jsx                 # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend-node/                    # Express API Gateway
│   └── src/
│       ├── config/
│       │   └── db.js                # MongoDB + fallback logic
│       ├── middleware/
│       │   └── auth.js              # JWT verification middleware
│       ├── models/
│       │   ├── User.js              # User schema
│       │   ├── Patient.js           # Patient schema (with triage history)
│       │   └── Appointment.js       # Appointment schema
│       ├── routes/
│       │   ├── auth.js              # /api/auth (login, register)
│       │   ├── patients.js          # /api/patients (CRUD + triage)
│       │   └── appointments.js      # /api/appointments (CRUD)
│       └── server.js                # App entry + data seeding
│
├── backend-python/                  # FastAPI AI Microservice
│   └── app/
│       ├── core/
│       │   ├── fuzzy_triage.py      # Mamdani FIS engine (NumPy)
│       │   └── bed_predictor.py     # Bed allocation logic
│       └── main.py                  # FastAPI app + endpoints
│   └── requirements.txt
│
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.9+
- **MongoDB** (optional — system runs without it in demo mode)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/hospital-management-careflow-ai.git
cd hospital-management-careflow-ai
```

---

### 2. Start the Python AI Microservice

```bash
cd backend-python
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

> AI engine will be live at `http://localhost:8001`  
> Interactive docs: `http://localhost:8001/docs`

---

### 3. Start the Node.js API Gateway

```bash
cd backend-node
npm install
```

Create a `.env` file (optional — works without it):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/careflow
JWT_SECRET=your_custom_secret_here
PYTHON_SERVICE_URL=http://127.0.0.1:8001
```

```bash
npm start
```

> API Gateway will be live at `http://localhost:5000`  
> Health check: `http://localhost:5000/api/health`

---

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

> App will be live at `http://localhost:3000`

---

### Quick Start (All 3 Services)

Open 3 terminals and run each step above simultaneously. The frontend connects to Node on `:5000`, and Node proxies triage requests to Python on `:8001`.

---

## 📡 API Reference

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT token | ❌ |
| POST | `/api/auth/register` | Register new user | ❌ |
| GET | `/api/auth/me` | Get current user info | ✅ |

### Patient Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/patients` | Get all patients | ✅ |
| POST | `/api/patients` | Register new patient | ✅ |
| GET | `/api/patients/:id` | Get patient by ID | ✅ |
| PUT | `/api/patients/:id` | Update patient | ✅ |
| DELETE | `/api/patients/:id` | Delete patient (Admin) | ✅ Admin |
| POST | `/api/patients/:id/triage` | Run AI triage for patient | ✅ |

### Appointment Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/appointments` | Get all appointments | ✅ |
| POST | `/api/appointments` | Book appointment | ✅ |
| PUT | `/api/appointments/:id` | Update/cancel appointment | ✅ |
| DELETE | `/api/appointments/:id` | Delete appointment | ✅ |

### Python AI Endpoints (`localhost:8001`)

| Method | Endpoint | Payload |
|---|---|---|
| POST | `/api/triage` | `{ heart_rate, spo2, temperature, symptom_severity }` |
| POST | `/api/bed-recommendation` | `{ triage_score, age, comorbidities_count, spo2, heart_rate }` |

#### Example Triage Request

```bash
curl -X POST http://localhost:8001/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "heart_rate": 115,
    "spo2": 89,
    "temperature": 101.5,
    "symptom_severity": 8
  }'
```

#### Example Triage Response

```json
{
  "score": 87.2,
  "category": "Critical",
  "recommendation": "Immediate ICU/Emergency admission needed. Call Code Red.",
  "membership_degrees": {
    "inputs": {
      "heart_rate": { "low": 0, "normal": 0, "high": 0.83 },
      "spo2": { "critical": 0.2, "borderline": 0.8, "normal": 0 },
      "temperature": { "low": 0, "normal": 0, "high": 0.5 },
      "symptoms": { "mild": 0, "moderate": 0, "severe": 0.83 }
    },
    "outputs": {
      "stable": 0, "normal": 0, "urgent": 0.5, "critical": 0.8
    }
  }
}
```

---

## 🖼️ Screenshots

### 🏠 Hospital Dashboard
> Real-time stats, bed occupancy, and critical patient alerts — all in one dark, glassmorphism UI.

![Hospital Dashboard](https://img.shields.io/badge/Dashboard-Live_Stats_&_Bed_Occupancy-06b6d4?style=for-the-badge)

---

### 🤖 AI Triage Console
> Enter patient vitals, run the fuzzy engine, and see the triage score, category, clinical recommendation, and bed allocation recommendation instantly.

![Triage System](https://img.shields.io/badge/Triage-Fuzzy_Logic_AI_Engine-ef4444?style=for-the-badge)

---

### 👥 Patient Management
> Full patient records with medical history, triage timeline, blood group, comorbidities, and emergency contacts.

![Patient Management](https://img.shields.io/badge/Patients-Full_CRUD_+_History-10b981?style=for-the-badge)

---

### 📅 Appointments
> Book, update, and cancel appointments with triage-linked priority context.

![Appointments](https://img.shields.io/badge/Appointments-Scheduling_+_Status-f59e0b?style=for-the-badge)

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Built with ❤️ for smarter, faster healthcare.

If you find this project helpful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**CareFlow AI** — *Where intelligent triage meets modern hospital management.*

</div>
