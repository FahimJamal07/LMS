const { v4: uuidv4 } = require('uuid');
const Leave = require('../models/Leave');
const User = require('../models/User');
const Audit = require('../models/Audit');
const { getLeaveDays } = require('../utils/dateUtils');

async function submitLeaveRequest(req, res, next) {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const user = req.user;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    const currentUser = await User.findOne({ id: user.id }).lean();
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const leaveDays = getLeaveDays(startDate, endDate);

    const newLeave = await Leave.create({
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      department: user.department || currentUser.department,
      leaveType,
      startDate,
      endDate,
      reason,
      leaveDays,
      status: 'pending',
      remarks: null,
      reviewedBy: null,
      reviewedAt: null,
      submittedAt: new Date().toISOString(),
    });

    await Audit.create({
      id: uuidv4(),
      action: 'leave.submitted',
      entity: 'leave',
      entityId: newLeave.id,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      message: `${user.name} submitted a ${leaveType} leave request for ${leaveDays} days`,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json(newLeave.toObject());
  } catch (err) {
    return next(err);
  }
}

async function reviewLeaveRequest(req, res, next) {
  try {
    const { requestId, status, remarks } = req.body;
    const user = req.user;

    if (!requestId || !status || !remarks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const leave = await Leave.findOne({ id: requestId });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Leave already reviewed' });
    }

    leave.status = status;
    leave.remarks = remarks;
    leave.reviewedBy = user.name;
    leave.reviewedAt = new Date().toISOString();
    await leave.save();

    await Audit.create({
      id: uuidv4(),
      action: 'leave.reviewed',
      entity: 'leave',
      entityId: leave.id,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      message: `${user.name} ${status} leave request by ${leave.userName}`,
      createdAt: new Date().toISOString(),
    });

    return res.json(leave.toObject());
  } catch (err) {
    return next(err);
  }
}

async function bulkReviewLeaveRequests(req, res, next) {
  try {
    const { requestIds, status, remarks } = req.body;
    const user = req.user;

    if (!requestIds || !Array.isArray(requestIds) || !status || !remarks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const pendingLeaves = await Leave.find({ id: { $in: requestIds }, status: 'pending' });

    for (const leave of pendingLeaves) {
      leave.status = status;
      leave.remarks = remarks;
      leave.reviewedBy = user.name;
      leave.reviewedAt = new Date().toISOString();
      await leave.save();

      await Audit.create({
        id: uuidv4(),
        action: 'leave.reviewed',
        entity: 'leave',
        entityId: leave.id,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        message: `${user.name} ${status} leave request by ${leave.userName}`,
        createdAt: new Date().toISOString(),
      });
    }

    return res.json({ count: pendingLeaves.length, leaves: pendingLeaves.map((leave) => leave.toObject()) });
  } catch (err) {
    return next(err);
  }
}

async function getStudentDashboard(req, res, next) {
  try {
    const user = req.user;

    const leaves = await Leave.find({ userId: user.id }).lean();
    const totalSubmitted = leaves.length;
    const pending = leaves.filter((l) => l.status === 'pending').length;
    const approved = leaves.filter((l) => l.status === 'approved').length;
    const rejected = leaves.filter((l) => l.status === 'rejected').length;

    return res.json({
      leaves,
      stats: {
        totalSubmitted,
        pending,
        approved,
        rejected,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getFacultyDashboard(req, res, next) {
  try {
    const leaves = await Leave.find({ status: { $in: ['pending', 'approved', 'rejected'] } }).lean();
    const pendingRequests = leaves.filter((leave) => leave.status === 'pending');
    const approved = leaves.filter((leave) => leave.status === 'approved').length;
    const rejected = leaves.filter((leave) => leave.status === 'rejected').length;
    const reviewedRequests = leaves.filter((leave) => leave.reviewedAt);

    const turnaroundMinutes = reviewedRequests
      .map((leave) => new Date(leave.reviewedAt).getTime() - new Date(leave.submittedAt).getTime())
      .filter((value) => Number.isFinite(value) && value > 0);

    const averageTurnaroundMinutes =
      turnaroundMinutes.length > 0 ? turnaroundMinutes.reduce((sum, value) => sum + value, 0) / turnaroundMinutes.length : 0;

    const completeRequests = leaves.filter((leave) => leave.reason.trim().length >= 30);
    const escalations = leaves.filter((leave) => {
      if (leave.status === 'rejected') {
        return true;
      }

      if (leave.status !== 'pending') {
        return false;
      }

      const ageInHours = (Date.now() - new Date(leave.submittedAt).getTime()) / (60 * 60 * 1000);
      return ageInHours >= 4;
    }).length;

    return res.json({
      requests: pendingRequests,
      metrics: {
        pending: pendingRequests.length,
        approved,
        rejected,
      },
      activity: {
        averageTurnaroundMinutes,
        completeness: leaves.length > 0 ? Math.round((completeRequests.length / leaves.length) * 100) : 0,
        escalations,
        reviewedCount: reviewedRequests.length,
        requestCount: leaves.length,
        completeCount: completeRequests.length,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getLeaveRequest(req, res, next) {
  try {
    const { requestId } = req.params;
    const leave = await Leave.findOne({ id: requestId }).lean();

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    return res.json(leave);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  submitLeaveRequest,
  reviewLeaveRequest,
  bulkReviewLeaveRequests,
  getStudentDashboard,
  getFacultyDashboard,
  getLeaveRequest,
};
