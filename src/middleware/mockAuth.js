const User = require('../models/User');
const { asyncHandler } = require('./asyncHandler');

// Sample auth middleware:
// - Read user identity from the `x-user-id` header.
// - Loads the user from MongoDB and attaches it to `req.user`.
//
// In a real system, replace this with JWT/session auth.
const mockAuth = asyncHandler(async (req, res, next) => {
  const userId = req.header('x-user-id');
  if (!userId) {
    return next();
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    return res.status(401).json({ message: 'Invalid x-user-id' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ message: 'User is inactive' });
  }

  req.user = {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  };

  return next();
});

module.exports = { mockAuth };
