const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Audit = require('../models/Audit');

async function getAdminDashboard(req, res, next) {
  try {
    const [users, leaves, audits] = await Promise.all([
      User.find().lean(),
      Leave.find().lean(),
      Audit.find().sort({ createdAt: -1 }).lean(),
    ]);

  const totalUsers = users.filter((u) => u.role !== 'admin').length;
  const activeStudents = users.filter((u) => u.role === 'student' && u.active).length;
  const totalLeaveRequests = leaves.length;
  const pendingRequests = leaves.filter((l) => l.status === 'pending').length;
  const approvedRequests = leaves.filter((l) => l.status === 'approved').length;
  const rejectedRequests = leaves.filter((l) => l.status === 'rejected').length;

  // Leave status distribution
  const statusDistribution = {
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  // Leave type distribution
  const typeDistribution = {};
  leaves.forEach((leave) => {
    typeDistribution[leave.leaveType] = (typeDistribution[leave.leaveType] || 0) + 1;
  });

    return res.json({
      users,
      leaves,
      audits,
      metrics: {
        totalUsers,
        activeStudents,
        totalLeaveRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
      },
      analytics: {
        statusDistribution,
        typeDistribution,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await User.find().lean();
    return res.json(users);
  } catch (err) {
    return next(err);
  }
}

async function toggleUserActiveStatus(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin' && user.active) {
      const activeAdminCount = await User.countDocuments({ role: 'admin', active: true });
      if (activeAdminCount <= 1) {
        return res.status(400).json({ error: 'Cannot disable the last admin user' });
      }
    }

    user.active = !user.active;
    await user.save();

    await Audit.create({
      id: uuidv4(),
      action: 'user.status-toggled',
      entity: 'user',
      entityId: user.id,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      message: `User ${user.name} status changed to ${user.active ? 'active' : 'disabled'}`,
      createdAt: new Date().toISOString(),
    });

    return res.json(user.toObject());
  } catch (err) {
    return next(err);
  }
}

async function getAuditLogs(req, res, next) {
  try {
    const { action, search } = req.query;
    const query = {};

    if (action) {
      query.action = action;
    }

    if (search) {
      query.$or = [
        { actorName: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const audits = await Audit.find(query).sort({ createdAt: -1 }).lean();
    return res.json(audits);
  } catch (err) {
    return next(err);
  }
}

async function getLeaveAnalytics(req, res, next) {
  try {
    const leaves = await Leave.find().lean();

  // Status distribution
  const statusDistribution = {
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  // Type distribution
  const typeDistribution = {};
  const typeBreakdown = {};
  
  leaves.forEach((leave) => {
    typeDistribution[leave.leaveType] = (typeDistribution[leave.leaveType] || 0) + 1;
    
    if (!typeBreakdown[leave.leaveType]) {
      typeBreakdown[leave.leaveType] = {
        type: leave.leaveType,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
    }
    typeBreakdown[leave.leaveType][leave.status]++;
  });

  // Department distribution
  const departmentStats = {};
  leaves.forEach((leave) => {
    if (!departmentStats[leave.department]) {
      departmentStats[leave.department] = 0;
    }
    departmentStats[leave.department]++;
  });

    return res.json({
      statusDistribution,
      typeDistribution,
      typeBreakdown: Object.values(typeBreakdown),
      departmentStats,
      totalLeaves: leaves.length,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getAdminDashboard,
  listUsers,
  toggleUserActiveStatus,
  getAuditLogs,
  getLeaveAnalytics,
};
