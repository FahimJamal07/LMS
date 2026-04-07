# 🏗️ LMS System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│                      (http://localhost:5173)                    │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTPS/REST API
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│ React Frontend   │                  │ Browser Storage  │
│ • Vite Build     │                  │ • localStorage   │
│ • TypeScript     │                  │ • JWT Token      │
│ • Zustand State  │                  │ • User Session   │
└────────┬─────────┘                  └──────────────────┘
         │
         │ Bearer Token + JSON
         │ (Authorization Header)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Express.js API (http://localhost:3000)              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Request Pipeline                        │   │
│  │  1. CORS Middleware (Allow frontend origin)              │   │
│  │  2. JSON Parser (Parse request body)                     │   │
│  │  3. Authentication (Verify JWT token)                    │   │
│  │  4. Authorization (Check user role)                      │   │
│  │  5. Route Handler (Auth/Leave/Admin endpoints)           │   │
│  │  6. Database Operation (Read/Write to db.json)           │   │
│  │  7. Response (JSON with status code)                     │   │
│  │  8. Error Handler (Catch & format errors)                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Routes & Controllers                      │   │
│  │                                                           │   │
│  │  /api/auth            →  authController.js              │   │
│  │    ├─ POST /login       → authenticate()                 │   │
│  │    └─ POST /register    → registerUser()                 │   │
│  │                                                           │   │
│  │  /api/leave           →  leaveController.js             │   │
│  │    ├─ POST /submit      → submitLeaveRequest()           │   │
│  │    ├─ GET /:id          → getLeaveRequest()              │   │
│  │    ├─ POST /review      → reviewLeaveRequest()           │   │
│  │    └─ POST /bulk-review → bulkReviewLeaveRequests()      │   │
│  │                                                           │   │
│  │  /api/admin           →  adminController.js             │   │
│  │    ├─ GET /dashboard    → getAdminDashboard()            │   │
│  │    ├─ GET /users        → listUsers()                    │   │
│  │    ├─ PUT /users/:id/.. → toggleUserActiveStatus()       │   │
│  │    ├─ GET /audit-logs   → getAuditLogs()                 │   │
│  │    └─ GET /analytics    → getLeaveAnalytics()            │   │
│  │                                                           │   │
│  │  /api/notifications   →  notificationController.js      │   │
│  │    ├─ GET /            → getNotifications()              │   │
│  │    └─ POST /mark-read  → markNotificationsRead()         │   │
│  │                                                           │   │
│  │  /api/health          →  Health check endpoint          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Read/Write JSON data
         │ (Synchronous file operations)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│            File-Based Database (data/db.json)                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ "users": [                                               │  │
│  │   {                                                       │  │
│  │     "id": "u-admin",                                    │  │
│  │     "name": "Avery Stone",                              │  │
│  │     "email": "admin@leaveflow.dev",                     │  │
│  │     "password": "$2a$10$...(hashed)",                  │  │
│  │     "role": "admin",  // or "faculty" or "student"      │  │
│  │     "active": true,                                     │  │
│  │     ...more fields...                                   │  │
│  │   }                                                      │  │
│  │ ]                                                        │  │
│  │                                                          │  │
│  │ "leaves": [                                             │  │
│  │   {                                                      │  │
│  │     "id": "uuid-xxx",                                  │  │
│  │     "userId": "u-student",                              │  │
│  │     "leaveType": "sick",                               │  │
│  │     "status": "pending",  // or "approved", "rejected" │  │
│  │     "startDate": "2026-04-08",                         │  │
│  │     "endDate": "2026-04-10",                           │  │
│  │     ...more fields...                                   │  │
│  │   }                                                      │  │
│  │ ]                                                        │  │
│  │                                                          │  │
│  │ "notifications": [...]  // User notifications           │  │
│  │ "audits": [...]          // Audit trail                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. User Login Flow
```
Browser                      Backend                Database
   │                           │                       │
   ├──POST /auth/login────────>│                       │
   │   {email, password}        │                       │
   │                            ├──Read users────────>│
   │                            │<──[users data]──────┤
   │                            │                       │
   │                    [Check credentials]              │
   │                    [Valid? Generate JWT]           │
   │                            │                       │
   │<──200 OK + JWT─────────────│                       │
   │   {token, user}             │                       │
   │                            │                       │
   ├─Store token in localStorage                        │
   │                            │                       │
```

### 2. Submit Leave Request Flow
```
Browser                      Backend                Database
   │                           │                       │
   ├──POST /leave/submit───────>│                       │
   │   Bearer [token]           │                       │
   │   {leaveType, dates...}    │                       │
   │                            │                       │
   │                      [Verify JWT]                 │
   │                      [Validate input]              │
   │                            │                       │
   │                            ├──Create entry────────>│
   │                            │                       │
   │                            ├──Audit log────────━   │
   │                            │               ┌──────>│
   │<──201 Created──────────────│                       │
   │   {id, status: pending}    │                       │
   │                            │                       │
   [User sees new request in dashboard]
```

### 3. Review & Approve Leave Flow
```
Faculty Browser              Backend                Database
   │                           │                       │
   ├──POST /leave/review───────>│                       │
   │   Bearer [token]           │                       │
   │   {requestId, status,      │                       │
   │    remarks}                │                       │
   │                            │                       │
   │                      [Verify JWT]                 │
   │                      [Check role=faculty]         │
   │                      [Verify leave exists]        │
   │                      [Verify not already reviewed]│
   │                            │                       │
   │                            ├──Update leave────────>│
   │                            │   (lock it)           │
   │                            │                       │
   │                            ├──Add audit log───────>│
   │                            │                       │
   │<──200 OK──────────────────│                       │
   │   {id, status: approved}   │                       │
   │                            │                       │
   │                    [Faculty sees updated queue]
   │
Student Browser)
   │
   [Notification: Leave approved!]
   [Student sees status updated in dashboard]
```

## User Roles & Permissions Matrix

```
┌────────────────────────────────────────────────────────────────┐
│                     Permission Matrix                          │
├──────────────────┬──────────┬─────────┬─────────┬──────────────┤
│ Action           │ Student  │ Faculty │ Admin   │ Public       │
├──────────────────┼──────────┼─────────┼─────────┼──────────────┤
│ Login            │ ✅       │ ✅      │ ✅      │ ✅           │
│ Register         │ ✅       │ ✅      │ ✅      │ ✅           │
│ View own leaves  │ ✅       │ ✅      │ ✅      │ ❌           │
│ Submit leave     │ ✅       │ ❌      │ ❌      │ ❌           │
│ View own leaves  │ ✅       │ ✅      │ ✅      │ ❌           │
│ Review leaves    │ ❌       │ ✅      │ ✅      │ ❌           │
│ Bulk review      │ ❌       │ ✅      │ ✅      │ ❌           │
│ View all users   │ ❌       │ ❌      │ ✅      │ ❌           │
│ Toggle accounts  │ ❌       │ ❌      │ ✅      │ ❌           │
│ View audit logs  │ ❌       │ ❌      │ ✅      │ ❌           │
│ View analytics   │ ❌       │ ❌      │ ✅      │ ❌           │
└──────────────────┴──────────┴─────────┴─────────┴──────────────┘
```

## State Management

```
Frontend State Management (Zustand)
│
├─ authStore
│  ├─ user: User | null
│  ├─ token: string | null
│  └─ login(email, password) → setUser, setToken
│
├─ uiStore
│  ├─ mobileSidebarOpen: boolean
│  ├─ sidebarCollapsed: boolean
│  ├─ toasts: Toast[]
│  ├─ toggleMobileSidebar()
│  ├─ toggleSidebar()
│  └─ showToast(message, type)
│
└─ leaveStore (optional, for leave data)
   ├─ leaves: LeaveRequest[]
   └─ fetchLeaves() → setLeaves
```

## Security Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: HTTPS/TLS (Production)        │
│  Encrypts all data in transit           │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│  Layer 2: CORS Middleware               │
│  Restricts requests to frontend origin  │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│  Layer 3: JWT Authorization             │
│  Validates token in Authorization header│
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│  Layer 4: Role-Based Authorization      │
│  Checks if user role can access route   │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│  Layer 5: Input Validation              │
│  Validates request data format/values   │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│  Layer 6: Business Logic Validation     │
│  Checks leave not already reviewed, etc │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│  Layer 7: Data Encryption (Passwords)   │
│  Bcryptjs hashing for password storage  │
└─────────────────────────────────────────┘
```

## Request/Response Format

### Success Response
```json
{
  "status": 200,
  "data": {...}
}
```

### Error Response
```json
{
  "error": "Description of what went wrong"
}
```

### Headers
```
Request:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
  Content-Type: application/json
  Access-Control-Allow-Origin: http://localhost:5173
```

## Error Handling Flow

```
API Request
    │
    ├─ [Route Handler]
    │  └─ try {
    │       execute business logic
    │     } catch (err) {
    │       pass to error handler
    │     }
    │
    └─ [Error Handler Middleware]
       │
       ├─ Log error to console
       ├─ Determine HTTP status
       ├─ Format error response
       └─ Send response → Browser
```

---

This architecture supports the full LMS workflow with secure, scalable design patterns suitable for production deployment.
