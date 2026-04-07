# 🚀 LeaveSphere – Leave Management System

A modern, role-based **Leave Management System** built with a premium SaaS-style UI.
Designed for educational institutions to streamline leave applications, approvals, and tracking.

---

## ✨ Features

### 👨‍🎓 Student

* Apply for leave (Sick, Casual, Medical, etc.)
* View leave history
* Track approval status (Pending / Approved / Rejected)
* View leave balance

### 👨‍🏫 Faculty

* View pending leave requests
* Approve / Reject with remarks
* Quick decision interface

### 🏫 Admin

* View all leave requests
* Analytics dashboard (charts & trends)
* Manage users

---

## 🎨 UI Highlights

* 💎 Premium SaaS-style design (inspired by Stripe / Linear)
* 🌙 Dark mode interface
* ⚡ Smooth animations (Framer Motion)
* 📱 Fully responsive (mobile + desktop)
* 🧩 Modular component architecture

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Zustand (state management)
* Recharts (analytics)

### Backend

* Node.js
* Express.js
* MongoDB (Atlas)
* JWT Authentication

### Deployment

* Frontend → Vercel
* Backend → Render

---

## 📁 Project Structure

```
leave-management-system/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── store/
│   │   ├── services/
│   │   └── utils/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
```

---

## ⚙️ Setup Instructions

### 🔹 1. Clone the Repository

```
git clone https://github.com/FahimJamal07/LMS.git
```

---

### 🔹 2. Setup Backend

```
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d
```

Run backend:

```
npm start
```

---

### 🔹 3. Setup Frontend

```
cd frontend
npm install
npm run dev
```

Create `.env`:

```
VITE_BACKEND_URL=http://localhost:5000/api
```

---

## 🌐 Deployment

### Frontend (Vercel)

* Build: `npm run build`
* Output: `dist`

### Backend (Render)

* Root: `backend`
* Start: `npm start`

---

## 🔐 Authentication

* JWT-based authentication
* Role-based access:

  * Student
  * Faculty
  * Admin

---

## 📊 Key Modules

* Leave Application System
* Approval Workflow
* Analytics Dashboard
* User Management
* Notification UI (mocked)

---

## 🧠 Future Enhancements

* 📩 Email notifications
* 📎 File upload (medical proof)
* 🔔 Real-time notifications (WebSockets)
* 📅 Calendar integration
* 🤖 AI-based leave prediction

---

## 👨‍💻 Author

**Fahim Jamal**
AIML Student | Full Stack Developer

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
