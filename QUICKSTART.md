# 🚀 LMS - Ready to Run Guide

Quick reference for getting the Leave Management System up and running with both frontend and backend.

## ⚡ 60-Second Setup

### Option 1: Automatic (Windows)
```batch
cd d:\.vscode\lms
setup.bat
```

### Option 2: Automatic (macOS/Linux)
```bash
cd /path/to/lms
chmod +x setup.sh
./setup.sh
```

### Option 3: Manual

**Terminal 1 - Backend:**
```bash
cd d:\.vscode\lms\backend
npm install    # (if not done yet)
npm start
```

**Terminal 2 - Frontend:**
```bash
cd d:\.vscode\lms
npm install    # (if not done yet)
npm run dev
```

## 🎯 What You Get

After startup:
- Backend API: `http://localhost:3000/api`
- Frontend App: `http://localhost:5173`
- Database: `backend/data/db.json` (auto-created)

## 👤 Test Accounts

All use password: `Password123!`

```
📧 admin@leaveflow.dev         (Admin)
📧 faculty@leaveflow.dev       (Faculty)
📧 student@leaveflow.dev       (Student)
📧 noah.parker@leaveflow.dev   (Student)
```

## 📋 Features Ready

### ✅ Student Features
- Submit leave requests (sick, personal, casual, urgent)
- View leave history
- Track request status
- View approval remarks

### ✅ Faculty Features
- Review pending leave requests
- Single approval/rejection
- Bulk approve/reject multiple requests
- Add reviewer remarks

### ✅ Admin Features
- View all users and leaves
- Enable/disable user accounts
- View comprehensive audit logs
- Leave analytics and statistics
- Dashboard with key metrics

### ✅ System Features
- JWT token authentication
- Role-based access control
- Automatic audit logging
- Persistent data storage
- Data validation
- Error handling

## 🔌 API Endpoints

### No Auth Required
```
POST   /api/auth/login               - Login to system
POST   /api/auth/register            - Create new account
GET    /api/health                   - Server health check
```

### Auth Required
```
POST   /api/leave/submit             - Submit leave
GET    /api/leave/student-dashboard  - View your leaves
GET    /api/leave/:id                - View leave details
POST   /api/leave/review             - Review one leave (faculty)
POST   /api/leave/bulk-review        - Review multiple (faculty)
```

### Admin Only
```
GET    /api/admin/dashboard          - Admin metrics
GET    /api/admin/users              - All users
PUT    /api/admin/users/:id/toggle-status  - Enable/disable user
GET    /api/admin/audit-logs        - Audit trail
GET    /api/admin/analytics/leaves  - Leave stats
```

### Notifications
```
GET    /api/notifications            - Your notifications
POST   /api/notifications/mark-read  - Mark as read
```

## 🛠️ Configuration Files

### Frontend `.env.local`
```env
VITE_USE_BACKEND=true
VITE_BACKEND_URL=http://localhost:3000/api
```

### Backend `.env`
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d
```

## 📂 Project Structure

```
lms/
├── src/                           # React frontend
│   ├── pages/
│   │   ├── auth/                 # Login/Register
│   │   └── dashboard/            # Role-specific dashboards
│   ├── components/               # Reusable components
│   │   ├── layout/              # Navbar, Sidebar, Layout
│   │   └── ui/                  # Dialog, Input, etc.
│   ├── services/
│   │   ├── mockApi.ts           # Mock API (localStorage)
│   │   └── backendApi.ts        # Real API calls
│   └── types/                    # TypeScript types
├── backend/                       # Express.js backend
│   ├── server.js                # Main server
│   ├── config/                  # Database config
│   ├── controllers/             # Business logic
│   ├── routes/                  # API routes
│   ├── middleware/              # Auth, error handling
│   ├── utils/                   # Helper functions
│   ├── data/                    # JSON database
│   └── README.md                # API docs
├── INTEGRATION_GUIDE.md          # Complete integration guide
├── BACKEND_COMPLETION.md         # Backend details
├── setup.bat                     # Windows setup
└── setup.sh                      # Unix setup
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9
```

### CORS Error
- Ensure backend is running on `http://localhost:3000`
- Check `.env.local` has `VITE_BACKEND_URL=http://localhost:3000/api`

### 401 Unauthorized
- Make sure you're logged in first
- Token is stored in localStorage
- Check browser DevTools Network tab for auth header

### No Data After Login
- Backend must be running
- Database should auto-initialize
- Check `backend/data/db.json` exists

## 📊 Testing the API

### Using Browser Console
```javascript
// Get token (from login page)
const token = localStorage.getItem('auth.token');

// Test request
fetch('http://localhost:3000/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

### Using curl
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@leaveflow.dev",
    "password":"Password123!"
  }'

# Use returned token in requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/dashboard
```

## 🚢 Deployment

### Local Network
Change `VITE_BACKEND_URL` to your machine IP:
```env
VITE_BACKEND_URL=http://192.168.1.100:3000/api
```

### Docker
```bash
# Build backend image
docker build -t lms-backend ./backend

# Run backend
docker run -p 3000:3000 lms-backend
```

### Production Checklist
- [ ] Change JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Use real database instead of JSON
- [ ] Enable HTTPS
- [ ] Set up logging
- [ ] Configure monitoring
- [ ] Set up backups
- [ ] Test all endpoints

## 📚 Documentation

| File | Purpose |
|------|---------|
| [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | Frontend-backend integration |
| [BACKEND_COMPLETION.md](BACKEND_COMPLETION.md) | Backend implementation details |
| [backend/README.md](backend/README.md) | API reference |
| [instructions.md](instructions.md) | Original project notes |

## 💡 Next Steps

1. ✅ **Verify Setup:** Run `npm run build` in both frontend and backend
2. ✅ **Test APIs:** Use curl or Postman to test endpoints
3. ✅ **User Test:** Login with test accounts and navigate
4. ✅ **Database:** Verify `backend/data/db.json` has data
5. 🔄 **Customize:** Modify leave types, roles, or UI as needed
6. 🚀 **Deploy:** Follow deployment checklist above

## 🎓 Learning Resources

- **Frontend:** React 18, TypeScript, Zustand, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js, JWT, bcryptjs, File-based DB
- **API:** RESTful architecture, Bearer tokens, Status codes
- **Database:** JSON persistence, Schema design, Audit logging

## 🤝 Support

For issues or improvements:
1. Check troubleshooting section above
2. Review error messages in browser console
3. Check backend logs in terminal
4. Review API response in DevTools Network tab

---

**You're all set! Happy leave managing! 🎉**

Start with any test account and explore the features.
All data persists automatically in `backend/data/db.json`.
