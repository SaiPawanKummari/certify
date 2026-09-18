# Certify – AI-Enhanced Digital Certificate Authentication and Fraud Detection System

<p align="center">
  <strong>A Secure, Intelligent, and Verifiable Digital Certificate Management Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Python-AI-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-AI_Service-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
</p>

---

## 📌 Overview

**Certify** is an AI-enhanced, web-based digital certificate authentication and fraud/anomaly detection system that simplifies and secures the issuance, management, verification, and monitoring of digital certificates.

It combines **SHA-256 cryptographic integrity verification, QR-code-based verification, role-based access control, certificate lifecycle management, audit logging, and AI-based anomaly detection** into a single platform.

Authorized issuers create certificates containing student and achievement information. Each certificate receives a unique ID, a SHA-256 hash, and a QR code for instant public verification. Students can access and download their certificates, while recruiters, institutions, and other third parties can verify them without needing an account. An AI-based anomaly detection service analyzes verification activity to flag unusual or suspicious patterns for administrators.

---

## 🎯 Objectives

- Provide a secure platform for digital certificate issuance
- Generate a unique identifier and SHA-256 hash for every certificate
- Enable instant QR-code-based public verification (no login required)
- Support certificate expiration and revocation
- Maintain verification history and audit activity logs
- Implement secure role-based access control
- Detect unusual verification behavior using AI
- Generate professional certificate PDFs

---

## ✨ Key Features

### 🔐 Authentication & Access Control
- JWT-based authentication with bcrypt password hashing
- Role-based access control across four roles:

| Role | Description |
|------|-------------|
| **Administrator** | Manages users, certificates, verification history, activity logs, and AI security analysis |
| **Issuer** | Creates and issues digital certificates |
| **Student** | Views and downloads their certificates |
| **Public Verifier** | Verifies certificates via ID or QR code — no account needed |

### 📜 Certificate Issuance
Issuers create certificates with dynamic fields (student name, course, organization, dates, grade, skills, etc.). Each certificate gets a unique ID, e.g. `CERT-2026-46EBA279`.

### 🔑 SHA-256 Integrity Verification
Certificate data is canonicalized (recursively sorted JSON) before hashing, so the hash is independent of key ordering. On verification, the data is re-canonicalized and re-hashed — a mismatch flags tampering.

### 📱 QR Code & Public Verification
Every certificate includes a QR code linking to a public verification page. Verification checks, in order: certificate exists → not revoked → not expired → hash matches.

**Certificate statuses:**

| Status | Meaning |
|--------|---------|
| 🟢 Valid | Exists, active, not expired, hash matches |
| 🔴 Revoked | Explicitly revoked |
| 🟡 Expired | Past expiry date |
| ⚫ Invalid | Does not exist or fails integrity check |

### 🚫 Revocation
Authorized users can revoke certificates, with the reason, date, and revoking user recorded. Revoked certificates are flagged on all future verification attempts.

### 📄 PDF Generation
Professional certificate PDFs are generated programmatically (not from a fixed image), including QR code and SHA-256 security details.

### 🤖 AI-Based Fraud / Anomaly Detection
A dedicated AI service combines an **Isolation Forest** model with **rule-based risk scoring** to flag unusual verification behavior. It analyzes features such as total/failed/revoked verification attempts, recent activity, failure ratio, and timing patterns.

**Risk classification:**

| Risk Level | Score |
|-----------|-------|
| 🟢 LOW | R < 40 |
| 🟡 MEDIUM | 40 ≤ R < 70 |
| 🔴 HIGH | R ≥ 70 |

> The AI component assists administrators with security triage — it does not claim to determine fraud with certainty.

---

## 🏗️ System Architecture

```
                Admin | Issuer | Student | Public Verifier
                              │
                              ▼
                  React Frontend (Vite + Axios)
                              │
                         REST / JSON
                              │
                              ▼
              Node.js + Express (Auth, RBAC, Certificate
              Management, SHA-256, QR/PDF Generation,
              Verification, Activity Logging)
                     │                    │
                     ▼                    ▼
              PostgreSQL          Python + FastAPI
         (Users, Certificates,    AI Service (Isolation
          History, Logs, etc.)    Forest, Risk Scoring)
```

---

## 🗄️ Database Design

PostgreSQL is used for persistent storage. Core tables:

`users` · `certificates` · `verification_history` · `notifications` · `activity_logs` · `templates`

Certificate hash-related data is stored using PostgreSQL's JSONB support.

---

## 🧰 Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Vite, Axios, JavaScript, HTML5, CSS3 |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, PDFKit, QR code generation |
| **Database** | PostgreSQL |
| **AI Service** | Python, FastAPI, scikit-learn (Isolation Forest) |
| **Security** | JWT, RBAC, bcrypt, SHA-256, revocation & verification history, activity logging |

---

## 📁 Project Structure

```
certify/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   └── public/
├── server/                 # Node.js + Express backend
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── server.js
├── ai/                      # Python + FastAPI AI service
│   └── app.py
├── .gitignore
├── .env.example
└── README.md
```

> Directory structure may vary slightly depending on the current repository version.

---

## ⚙️ Installation

### Prerequisites
Node.js · npm · PostgreSQL · Python 3.x · pip · Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR-USERNAME/certify.git
cd certify
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=certify
DB_PASSWORD=your_password
DB_PORT=5432

JWT_SECRET=your_secure_jwt_secret

PORT=5000
```
> Never commit your actual `.env` file to GitHub.

### 3. Database Setup
```sql
CREATE DATABASE certify;
```
Set up the required tables (`users`, `certificates`, `verification_history`, `notifications`, `activity_logs`, `templates`) per the project's schema.

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Runs at `http://localhost:5173`

### 5. Start the Backend
```bash
cd server
npm start
```
Runs at `http://localhost:5000`

### 6. AI Service Setup
```bash
cd ai
pip install fastapi uvicorn scikit-learn
uvicorn app:app --reload --port 8000
```
Runs at `http://127.0.0.1:8000`

### Running All Three Services
| Terminal | Command |
|----------|---------|
| 1 – Backend | `cd server && npm start` |
| 2 – Frontend | `cd client && npm run dev` |
| 3 – AI Service | `cd ai && uvicorn app:app --reload --port 8000` |

Then open `http://localhost:5173`

---

## 🔗 Main Application Routes

```
/verify
/verify/:certificateId

/admin/dashboard
/admin/users
/admin/verification-history
/admin/ai-security
```

---

## 🔒 Security Architecture

User Authentication (JWT) → Role-Based Access Control → Certificate Integrity (SHA-256) → QR-Based Verification → Revocation & Expiry Checks → Audit & Verification History → AI Anomaly Detection

---

## 🧪 Testing & Evaluation

Core workflows have been exercised end-to-end, including registration, JWT auth, RBAC, certificate issuance, SHA-256 and QR verification, PDF generation, revocation, expiry validation, activity logging, and AI security analysis across all four dashboards.

The AI component is designed primarily for behavioral anomaly indication; formal evaluation on a larger labelled dataset is future work.

---

## ⚠️ Limitations

- AI anomaly detection depends on available verification activity volume
- Does not provide definitive proof of fraud
- A larger real-world dataset would improve AI evaluation
- Formal performance benchmarking has not been extensively performed
- Production deployment requires additional infrastructure hardening (secrets, keys, passwords)

---

## 🚀 Future Enhancements

Blockchain-based hash anchoring · Decentralized identity integration · LMS/ERP integration · Mobile app · Multilingual verification · Cloud deployment · Secure certificate sharing links · Larger AI training datasets · Advanced anomaly detection models

---

## 🔐 Security & Deployment Notes

This repository is intended for **academic, educational, and research purposes**. Before production use, implement HTTPS/TLS, strong JWT secrets, secure secret management, DB access restrictions, API rate limiting, input validation, production CORS config, secure headers, dependency scanning, and proper log retention.

**Never commit:** `.env`, database passwords, JWT secrets, API keys, or private credentials. Use `.env.example` to document required variables.

---

## 📄 License

Developed primarily for academic and educational purposes. If distributing or reusing, add an appropriate license (e.g., MIT) or specify applicable academic-use terms.

---

## ⭐ Highlights

Secure Authentication · Role-Based Access Control · Unique Certificate IDs · SHA-256 Integrity · QR Code Verification · Public Verification · Revocation & Expiry Validation · Professional PDF Generation · Verification History & Activity Logging · AI-Based Anomaly Detection (Isolation Forest + Rule-Based Scoring) · PostgreSQL · React · Node.js/Express · Python/FastAPI
