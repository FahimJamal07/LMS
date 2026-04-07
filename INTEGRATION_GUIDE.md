# LMS Backend-Frontend Integration Guide

This guide explains how the Leave Management System backend and frontend work together, and how to configure and deploy them.

## Architecture Overview

```
┌─────────────────────┐
│  React Frontend     │
│  (Vite, Zustand)    │
├─────────────────────┤
│   API Client        │
│   (backendApi.ts)   │
└──────────┬──────────┘
           │ HTTP/REST
           │ (Bearer Token)
           ▼
┌─────────────────────┐
│  Express Backend    │
│  (Node.js)          │
├─────────────────────┤
│  Routes, Middleware │
│  Controllers        │
├─────────────────────┤
│  File-based DB      │
│  (data/db.json)     │
└─────────────────────┘
```

## Quick Start (All-in-One)

### 1. Windows Setup
```batch
cd d:\.vscode\lms
setup.bat
```

### 2. macOS/Linux Setup
```bash
cd /path/to/lms
chmod +x setup.sh
./setup.sh
```

### 3. Manual Setup (Alternative)

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend (in another terminal):**
```bash
npm run dev
```

## Configuration

### Frontend Environment Variables

Create `.env.local` in the frontend root:

```env
# Use real backend (false = mock API)
VITE_USE_BACKEND=true

# Backend API URL
VITE_BACKEND_URL=http://localhost:3000/api
```

### Backend Environment Variables

Update `backend/.env`:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d
```

## Development Workflow

### Terminal 1 - Start Backend

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 LMS Backend running on http://localhost:3000
Environment: development
📦 Database initialized
```

### Terminal 2 - Start Frontend

```bash
npm run dev
```

Expected output:
```
VITE v5.4.21 dev server running at:

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Terminal 3 - Test API (Optional)

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@leaveflow.dev","password":"Password123!"}'
```

## API Integration Details

### Authentication Flow

1. **Login** - Frontend sends credentials to `/api/auth/login`
2. **Token Received** - Backend returns JWT token
3. **Token Storage** - Frontend stores token in `localStorage`
4. **Protected Requests** - All subsequent requests include `Authorization: Bearer <token>`

### Request Example

```javascript
// Frontend code
const loginResponse = await fetch(
  'http://localhost:3000/api/auth/login',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: 'student@leaveflow.dev',
      password: 'Password123!' 
    }),
  }
);

const { token, user } = await loginResponse.json();
localStorage.setItem('auth.token', token);

// Subsequent request with auth
const dashResponse = await fetch(
  'http://localhost:3000/api/leave/student-dashboard',
  {
    headers: { 
      'Authorization': `Bearer ${token}` 
    },
  }
);
```

### Response Example

```json
{
  "leaves": [
    {
      "id": "uuid-1234",
      "userId": "u-student",
      "userName": "Maya Fernandez",
      "leaveType": "sick",
      "startDate": "2026-04-08",
      "endDate": "2026-04-10",
      "reason": "High fever",
      "status": "pending",
      "submittedAt": "2026-04-07T10:30:00Z"
    }
  ],
  "stats": {
    "totalSubmitted": 3,
    "pending": 1,
    "approved": 2,
    "rejected": 0
  }
}
```

## Default Test Accounts

All passwords are `Password123!`

| Email | Role | Department |
|-------|------|-----------|
| admin@leaveflow.dev | admin | Registry |
| faculty@leaveflow.dev | faculty | Computer Science |
| student@leaveflow.dev | student | Computer Science |
| noah.parker@leaveflow.dev | student | Business Administration |

## Switching Between Mock API and Real Backend

### Use Mock API (Default)

`.env.local`:
```env
VITE_USE_BACKEND=false
```

Behavior:
- No backend server needed
- Data stored in browser localStorage
- Perfect for offline development
- Data resets on page refresh

### Use Real Backend

`.env.local`:
```env
VITE_USE_BACKEND=true
VITE_BACKEND_URL=http://localhost:3000/api
```

Behavior:
- Requires backend server running
- Data persisted in `backend/data/db.json`
- Real authentication with JWT tokens
- Closer to production setup

## Database Persistence

### File Location
```
backend/
├── data/
│   └── db.json
```

### Data Structure
```json
{
  "users": [...],
  "leaves": [...],
  "notifications": [...],
  "audits": [...]
}
```

### Reset Database
Delete `backend/data/db.json` - it will be recreated with seed data on next backend start.

## Common Issues & Solutions

### Issue: CORS Error
**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:** Backend has CORS enabled. Check:
1. Backend is running on `http://localhost:3000`
2. Frontend `.env.local` has correct `VITE_BACKEND_URL`
3. No typos in URL

### Issue: 401 Unauthorized
**Problem:** API returns "No token provided" or "Invalid token"

**Solution:**
1. Ensure you're logged in first
2. Check token is being sent in Authorization header
3. Check JWT_SECRET in backend `.env` is not empty

### Issue: 404 Not Found
**Problem:** One of the API routes is missing

**Solution:**
1. Ensure backend is running (`npm run dev` in backend folder)
2. Check route spelling matches exactly
3. Check you're using correct HTTP method (GET/POST/PUT)

### Issue: Empty Database
**Problem:** No initial data appears after login

**Solution:**
1. Backend automatically seeds data on first run
2. If needed, delete `backend/data/db.json` and restart backend
3. Check backend logs for "Database initialized" message

## Deployment Guide

### Local Network Access

Make backend accessible to other machines:

**backend/.env:**
```env
PORT=3000
# Allows connections from other machines
```

**Frontend .env.local:**
```env
VITE_BACKEND_URL=http://YOUR_MACHINE_IP:3000/api
```

Replace `YOUR_MACHINE_IP` with your machine's IP address (e.g., `192.168.1.100`).

### Production Deployment Checklist

- [ ] Change `JWT_SECRET` in backend `.env` to a strong value
- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Run `npm run build` for frontend (creates `dist/` folder)
- [ ] Use a proper database (MongoDB, PostgreSQL) instead of file-based
- [ ] Set up environment variables on production server
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for your frontend domain
- [ ] Set up backup strategy for database
- [ ] Monitor logs and errors

### Docker Deployment

**Dockerfile for Backend:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      JWT_SECRET: ${JWT_SECRET}
```

## Monitoring & Debugging

### Backend Logs

The backend logs important events:
```
🚀 LMS Backend running on http://localhost:3000
📦 Database initialized
[timestamp] POST /api/auth/login - User logged in
[timestamp] POST /api/leave/submit - Leave request created
```

### Frontend DevTools

1. Open browser DevTools (F12)
2. Network tab - see all API calls and responses
3. Application tab - see tokens in localStorage
4. Console - see any JavaScript errors

### API Testing

**Using Chrome DevTools Console:**
```javascript
// Get auth token
const token = localStorage.getItem('auth.token');

// Make API request
fetch('http://localhost:3000/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log(data));
```

**Using curl:**
```bash
# Get token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@leaveflow.dev","password":"Password123!"}' \
  | jq -r '.token')

# Use token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/dashboard
```

## API Endpoints Summary

See `backend/README.md` for complete endpoint documentation.

Quick reference:
- `POST /api/auth/login` - Login
- `POST /api/leave/submit` - Submit leave request
- `POST /api/leave/review` - Review request (faculty)
- `GET /api/admin/dashboard` - Admin metrics (admin only)
- `PUT /api/admin/users/:userId/toggle-status` - Toggle user status (admin only)

## Support & Next Steps

1. **Explore the Code:** Start with `backend/server.js` and `src/App.tsx`
2. **Modify Routes:** Add new endpoints in `backend/routes/`
3. **Add Features:** Create new controllers following existing patterns
4. **Database:** Replace file-based DB with MongoDB or PostgreSQL
5. **Testing:** Add unit tests with Jest and integration tests

---

**Happy coding! 🚀**
