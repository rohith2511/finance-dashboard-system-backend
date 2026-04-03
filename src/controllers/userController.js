const User = require('../models/User');

function toUserDto(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

async function createUser(req, res) {
  const userCount = await User.countDocuments();
  const isBootstrap = userCount === 0;

  if (!isBootstrap) {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Provide x-user-id header.' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin role required' });
    }
  }

  const payload = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    status: req.body.status
  };

  // If no users exist, allow creating the first admin without authentication.
  if (isBootstrap) {
    payload.role = 'admin';
    payload.status = 'active';
  }

  const user = await User.create(payload);

  return res.status(201).json({ data: toUserDto(user) });
}

async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return res.json({ data: users.map((u) => toUserDto(u)) });
}

async function updateUser(req, res) {
  const updates = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    status: req.body.status
  };

  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ data: toUserDto(user) });
}

async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(204).send();
}

module.exports = {
  createUser,
  listUsers,
  updateUser,
  deleteUser
};
