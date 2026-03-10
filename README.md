# Automated Digital Workspace for Advocates
This repository contains the engineering mini project **Automated Digital Workspace for Advocates**, developed by Team 10 (Alwin Emmanuel, Jeevan P Joju, Chrismilin Antony, Liz Joy) at AISAT, Kalamassery.  

The project modernizes legal practice management by providing a secure, web‑based workspace for advocates and small law firms.

---

## 2. Project Description
The system is a **web‑based management platform** designed to digitize and streamline legal operations. It integrates client management, case tracking, appointment scheduling, payment monitoring, and document handling into one centralized workspace.  

It is accessible via desktop and mobile browsers, with role‑based access for advocates, assistants, and administrators.

---

## 3. The Problem Statement
- Advocates rely heavily on paper‑based methods, leading to inefficiency and errors.  
- Case files, appointments, and payments are managed in fragmented ways.  
- Missed deadlines and poor record‑keeping reduce client satisfaction.  
- Affordable, user‑friendly digital solutions for small law firms are scarce.  

---

## 4. The Solution
The project provides:  
- A **centralized digital workspace** accessible anywhere.  
- Automated case templates and reminders.  
- Secure document storage and retrieval.  
- Integrated appointment scheduling and payment tracking.  
- Role‑based access control ensuring confidentiality.  

---

## 5. Technical Details
- **Architecture:** React frontend + Django REST backend.  
- **Database:** PostgreSQL (ACID compliant).  
- **Deployment:** Cloud‑hosted, accessible via HTTPS.  
- **Authentication:** Django authentication with role‑based permissions.  
- **Performance:** Optimized queries, <4s page load, supports 20+ concurrent users.  
- **Compliance:** IT Act 2000, Bar Council of India confidentiality rules.  

---

## 6. Technologies / Components Used
- **Frontend:** React 18.x  
- **Backend:** Django 4.x + Django REST Framework  
- **Database:** PostgreSQL 13+  
- **Other Components:**  
  - WeasyPrint (PDF generation)  
  - SMTP (email notifications)  
  - Razorpay/Stripe (optional payment gateway)  
  - Nginx/Apache (web server)  
  - Cloud storage (Cloudinary)  

---

## 7. Features
- **Client Management:** Add, edit, search, and view client profiles with case history.  
- **Case Management:** Create, track, and update cases with documents and hearing dates.  
- **Template Library:** Ready‑to‑use editable case templates.  
- **Appointment Scheduling:** Calendar integration with automated reminders.  
- **Payment Tracking:** Record and monitor payments with history.  
- **Online Payment Service:** Optional integration with gateways.  
- **Automated Reminder System:** Notifications for hearings, payments, deadlines.  
- **User Management:** Role‑based access for advocates, staff, and administrators.  
- **Dashboard & Reports:** Visual overview of practice statistics and pending tasks.  

---

## 8. Installation
```bash
# Clone the repository
git clone https://github.com/Alwin42/Law-Suite.git

# Navigate to project directory
cd Law-Suite

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate (Linux)
venv/Scripts/activate (windows)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend setup
cd frontend
npm install
npm start
```

---

## 9. Snapshots


---

## 10. Video Demo


---

## 11. Team Contributions
- **Alwin Emmanuel:** Backend development,Integration, database design.  
- **Jeevan P Joju:** Frontend UI/UX design.  
- **Chrismilin Antony:**  Testing, deployment.  
- **Liz Joy:** Documentation, presentation, project coordination.  

---