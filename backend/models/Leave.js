const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
    department: { type: String, required: true },
    leaveType: { type: String, enum: ['sick', 'casual', 'personal', 'emergency', 'conference'], required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true },
    leaveDays: { type: Number, default: 1 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    remarks: { type: String, default: null },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: String, default: null },
    submittedAt: { type: String, required: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('Leave', leaveSchema);
