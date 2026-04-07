# LMS Backend API

A robust Node.js/Express backend for the Leave Management System (LMS) with JWT authentication, role-based access control, and comprehensive audit logging.

## Features

- ✅ JWT-based authentication with role-based access control
- ✅ User management (admin, faculty, student roles)
- ✅ Leave request submission and review workflow
- ✅ Bulk leave approval/rejection for faculty
- ✅ Comprehensive audit logging of all actions
- ✅ Admin dashboard with analytics
- ✅ Notification system
- ✅ MongoDB persistence with automatic seeding

## Project Structure

```
backend/
├── server.js                  # Express app entry point
├── package.json              # Dependencies
├── .env                       # Environment variables
├── config/
│   └── db.js                 # Database initialization and persistence
├── middleware/
│   ├── auth.js               # JWT authentication middleware
│   └── errorHandler.js       # Global error handler
├── controllers/
│   ├── authController.js     # Login/register logic
│   ├── leaveController.js    # Leave request logic
│   ├── adminController.js    # Admin operations
│   └── notificationController.js  # Notifications
├── routes/
│   ├── auth.js               # Auth endpoints
│   ├── leave.js              # Leave endpoints
│   ├── admin.js              # Admin endpoints
│   └── notifications.js      # Notification endpoints
└── utils/
    └── dateUtils.js          # Helper functions
```

## Quick Start

### Installation

```bash
cd backend
npm install
```

### Start MongoDB

Make sure MongoDB is running locally on port `27017` or provide your own URI in `.env`.

Quick Docker option:

```bash
docker run -d --name lms-mongo -p 27017:27017 mongo:7
```

### Running the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

### Environment Variables

Edit `.env` to customize:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d
MONGODB_URI=mongodb://127.0.0.1:27017/lms
```

## API Endpoints

### Authentication

- **POST** `/api/auth/login` - Login with email/password
- **POST** `/api/auth/register` - Register new user

### Leave Management

- **POST** `/api/leave/submit` - Submit leave request (requires auth)
- **POST** `/api/leave/review` - Review a leave request (faculty/admin)
- **POST** `/api/leave/bulk-review` - Bulk approve/reject leaves (faculty/admin)
- **GET** `/api/leave/student-dashboard` - Get student's leave requests
- **GET** `/api/leave/:requestId` - Get specific leave request details

### Admin Operations

- **GET** `/api/admin/dashboard` - Admin dashboard with metrics (admin only)
- **GET** `/api/admin/users` - List all users (admin only)
- **PUT** `/api/admin/users/:userId/toggle-status` - Enable/disable user (admin only)
- **GET** `/api/admin/audit-logs` - Get audit logs with filters (admin only)
- **GET** `/api/admin/analytics/leaves` - Leave analytics (admin only)

### Notifications

- **GET** `/api/notifications` - Get user's notifications (requires auth)
- **POST** `/api/notifications/mark-read` - Mark notifications as read (requires auth)

### Health Check

- **GET** `/api/health` - Server health status

## Default Test Accounts

The system seeds with these test accounts (password: `Password123!`):

| Email | Password | Role | Department |
|-------|----------|------|-----------|
| admin@leaveflow.dev | Password123! | admin | Registry |
| faculty@leaveflow.dev | Password123! | faculty | Computer Science |
| student@leaveflow.dev | Password123! | student | Computer Science |
| noah.parker@leaveflow.dev | Password123! | student | Business Administration |

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

Example:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/admin/dashboard
```

## Data Persistence

The backend uses MongoDB (database: `lms`) and persists:
- User accounts
- Leave requests
- Notifications
- Audit logs

Data is automatically seeded on first run with sample data.

## Frontend Integration

To use this backend with the React frontend:

1. Update the frontend's API client to point to this backend
2. Replace the mock API calls with real HTTP requests to these endpoints
3. Store the JWT token from login and include it in all subsequent requests

Example frontend integration:

```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const { token, user } = await response.json();
localStorage.setItem('token', token);

// Use token in subsequent requests
const adminResponse = await fetch('http://localhost:3000/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` },
});
```

## Key Features by Role

### Admin
- User management (enable/disable accounts)
- View all leave requests across system
- Comprehensive audit logs
- Leave analytics and statistics
- Cannot be disabled if they're the last admin

### Faculty
- Review pending leave requests from students
- Bulk approve/reject multiple requests
- Add remarks to decisions
- View student requests in queue

### Student
- Submit leave requests
- Track leave history
- View request status and reviewer remarks
- See leave balance information

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Server Error

Error responses include descriptive messages:

```json
{
  "error": "Email already registered"
}
```

## Development Notes

- JWT tokens expire after 7 days (configurable in `.env`)
- Passwords are hashed using bcryptjs (10 salt rounds)
- All timestamps are in ISO 8601 format
- Leave days calculation excludes weekends (Saturday/Sunday)

## Future Enhancements

- Managed MongoDB deployment (Atlas)
- Email notifications
- Caching layer (Redis)
- Advanced reporting and analytics
- Import/export leave data
- Holiday calendar management
- Leave encashment policies
