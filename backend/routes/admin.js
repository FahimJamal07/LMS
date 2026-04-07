const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getAdminDashboard,
  listUsers,
  toggleUserActiveStatus,
  getAuditLogs,
  getLeaveAnalytics,
} = require('../controllers/adminController');

const router = express.Router();

// Only admin can access these routes
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

router.get('/dashboard', authMiddleware, adminOnly, getAdminDashboard);
router.get('/users', authMiddleware, adminOnly, listUsers);
router.put('/users/:userId/toggle-status', authMiddleware, adminOnly, toggleUserActiveStatus);
router.get('/audit-logs', authMiddleware, adminOnly, getAuditLogs);
router.get('/analytics/leaves', authMiddleware, adminOnly, getLeaveAnalytics);

module.exports = router;
