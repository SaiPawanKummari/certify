# Certify – AI-Enhanced Digital Certificate Authentication and Fraud Detection System

<p align="center">
  <strong>A secure, intelligent, and verifiable digital certificate management platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Python-AI-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-AI%20Service-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
</p>

---

## 📌 Overview

**Certify** is an AI-enhanced web-based digital certificate authentication and fraud/anomaly detection system designed to simplify the process of issuing, managing, verifying, and securing digital certificates.

The platform combines **cryptographic integrity verification, QR-code-based authentication, role-based access control, certificate lifecycle management, audit logging, and AI-based anomaly detection** into a unified system.

Certify allows authorized institutions and issuers to generate digitally verifiable certificates while enabling students, organizations, recruiters, and the public to verify certificate authenticity using a unique certificate ID or QR code.

The system also analyzes verification activity to identify unusual or suspicious behavioral patterns and provides administrators with a risk indication for further review.

---

## 🎯 Objectives

The primary objectives of Certify are to:

- Provide a secure platform for digital certificate issuance.
- Generate a unique identifier for every certificate.
- Protect certificate integrity using **SHA-256 hashing**.
- Enable instant verification using **QR codes**.
- Provide public certificate verification without requiring authentication.
- Support certificate revocation and expiration management.
- Maintain verification history and activity logs.
- Implement role-based access control.
- Detect unusual verification behavior using AI-based anomaly detection.
- Provide administrators with a centralized security dashboard.
- Generate professional digital certificate PDFs.

---

## ✨ Key Features

### 🔐 Secure Authentication

- User registration and login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Role-based access control.
- Active/inactive user account management.

### 👥 Role-Based Access

Certify supports four major user roles:

| Role | Description |
|------|-------------|
| **Administrator** | Manages users, certificates, verification history, activity logs, and AI security analysis. |
| **Issuer** | Creates and issues digital certificates. |
| **Student** | Views and downloads their certificates. |
| **Public Verifier** | Verifies certificates using a certificate ID or QR code without authentication. |

---

### 📜 Digital Certificate Issuance

Authorized issuers can create certificates containing dynamic information such as:

- Student Name
- Student Email
- Course / Program
- Duration
- Certificate Type
- Organization
- Issuer
- Issue Date
- Expiry Date
- Grade / Score
- Description
- Skills / Achievements

Each certificate receives a unique identifier.

Example:

```text
CERT-2026-46EBA279
