const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Audit = require('../models/Audit');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );
}

async function authenticate(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    const token = generateToken(user);

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      department: user.department,
      avatarSeed: user.avatarSeed,
    };

    return res.json({ token, user: sessionUser });
  } catch (err) {
    return next(err);
  }
}

async function registerUser(req, res, next) {
  try {
    const { name, email, password, role, department, title } = req.body;

    if (!name || !email || !password || !role || !department || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const newUser = await User.create({
      id: `u-${uuidv4()}`,
      name,
      email: normalizedEmail,
      password: bcrypt.hashSync(password, 10),
      role,
      title,
      department,
      avatarSeed: name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .toUpperCase(),
      active: true,
    });

    await Audit.create({
      id: uuidv4(),
      action: 'user.registered',
      entity: 'user',
      entityId: newUser.id,
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      message: `${newUser.name} registered as ${newUser.role}`,
      createdAt: new Date().toISOString(),
    });

    const token = generateToken(newUser);

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      title: newUser.title,
      department: newUser.department,
      avatarSeed: newUser.avatarSeed,
    };

    return res.status(201).json({ token, user: sessionUser });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticate,
  registerUser,
};
