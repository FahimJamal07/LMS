const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  submitLeaveRequest,
  reviewLeaveRequest,
  bulkReviewLeaveRequests,
  getStudentDashboard,
  getFacultyDashboard,
  getLeaveRequest,
} = require('../controllers/leaveController');

const router = express.Router();

// Student endpoints
router.post('/submit', authMiddleware, submitLeaveRequest);
router.get('/student-dashboard', authMiddleware, getStudentDashboard);
router.get('/faculty-dashboard', authMiddleware, getFacultyDashboard);
router.get('/:requestId', authMiddleware, getLeaveRequest);

// Faculty/Admin endpoints
router.post('/review', authMiddleware, reviewLeaveRequest);
router.post('/bulk-review', authMiddleware, bulkReviewLeaveRequests);

module.exports = router;
