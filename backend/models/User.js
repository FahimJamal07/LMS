const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    avatarSeed: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  }
);

module.exports = mongoose.model('User', userSchema);
