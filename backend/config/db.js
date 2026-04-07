const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const Leave = require('../models/Leave');
const Audit = require('../models/Audit');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms';

function nowISO(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString();
}

function createLeave(user, data) {
  return {
    id: uuidv4(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    department: user.department,
    leaveType: data.leaveType,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason,
    leaveDays: data.leaveDays || 1,
    status: data.status || 'pending',
    remarks: data.remarks || null,
    reviewedBy: data.reviewedBy || null,
    reviewedAt: data.reviewedAt || null,
    submittedAt: data.submittedAt || nowISO(-1440),
  };
}

async function seedIfEmpty() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return;
  }

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const seedUsers = [
    {
      id: 'u-admin',
      name: 'Avery Stone',
      email: 'admin@leaveflow.dev',
      password: bcrypt.hashSync('Password123!', 10),
      role: 'admin',
      title: 'Operations Admin',
      department: 'Registry',
      avatarSeed: 'AS',
      active: true,
      createdAt: yesterday,
    },
    {
      id: 'u-faculty',
      name: 'Dr. Elena Carter',
      email: 'faculty@leaveflow.dev',
      password: bcrypt.hashSync('Password123!', 10),
      role: 'faculty',
      title: 'Department Lead',
      department: 'Computer Science',
      avatarSeed: 'EC',
      active: true,
      createdAt: yesterday,
    },
    {
      id: 'u-student',
      name: 'Maya Fernandez',
      email: 'student@leaveflow.dev',
      password: bcrypt.hashSync('Password123!', 10),
      role: 'student',
      title: 'B.Tech CSE - Year 3',
      department: 'Computer Science',
      avatarSeed: 'MF',
      active: true,
      createdAt: yesterday,
    },
    {
      id: 'u-student-2',
      name: 'Noah Parker',
      email: 'noah.parker@leaveflow.dev',
      password: bcrypt.hashSync('Password123!', 10),
      role: 'student',
      title: 'BBA - Year 2',
      department: 'Business Administration',
      avatarSeed: 'NP',
      active: true,
      createdAt: yesterday,
    },
  ];

  await User.insertMany(seedUsers);

  const seedLeaves = [
    createLeave(seedUsers[2], {
      leaveType: 'sick',
      startDate: '2026-04-08',
      endDate: '2026-04-10',
      reason: 'High fever and advised rest by the clinic.',
      leaveDays: 3,
      status: 'pending',
      submittedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    }),
    createLeave(seedUsers[2], {
      leaveType: 'personal',
      startDate: '2026-03-18',
      endDate: '2026-03-20',
      reason: 'Family event and important commitments.',
      leaveDays: 3,
      status: 'approved',
      remarks: 'Approved. Ensure all coursework is completed.',
      reviewedBy: seedUsers[1].name,
      reviewedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      submittedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  ];

  await Leave.insertMany(seedLeaves);

  await Audit.create({
    id: uuidv4(),
    action: 'user.registered',
    entity: 'user',
    entityId: 'u-student',
    actorId: 'u-student',
    actorName: 'Maya Fernandez',
    actorRole: 'student',
    message: 'User registered successfully',
    createdAt: yesterday.toISOString(),
  });

  console.log('🌱 MongoDB seeded with initial data');
}

async function init() {
  await mongoose.connect(MONGODB_URI);
  console.log('📦 MongoDB connected');
  await seedIfEmpty();
}

module.exports = {
  init,
};
