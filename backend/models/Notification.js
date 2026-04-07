const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, default: 'info' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    read: { type: Boolean, default: false },
    createdAt: { type: String, required: true, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
