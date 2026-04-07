const { v4: uuidv4 } = require('uuid');
const Notification = require('../models/Notification');

async function getNotifications(req, res, next) {
  try {
    const user = req.user;
    const notifications = await Notification.find({ userId: user.id }).sort({ createdAt: -1 }).lean();
    return res.json(notifications);
  } catch (err) {
    return next(err);
  }
}

async function markNotificationsRead(req, res, next) {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'notificationIds must be an array' });
    }

    const result = await Notification.updateMany({ id: { $in: notificationIds } }, { $set: { read: true } });
    return res.json({ count: result.modifiedCount });
  } catch (err) {
    return next(err);
  }
}

async function createNotification(userId, type, title, message, data = null) {
  const notification = await Notification.create({
    id: uuidv4(),
    userId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString(),
  });

  return notification.toObject();
}

module.exports = {
  getNotifications,
  markNotificationsRead,
  createNotification,
};
