const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getNotifications, markNotificationsRead } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.post('/mark-read', authMiddleware, markNotificationsRead);

module.exports = router;
