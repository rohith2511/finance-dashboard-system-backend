const mongoose = require('mongoose');

const ROLES = ['viewer', 'analyst', 'admin'];
const STATUSES = ['active', 'inactive'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 320
    },
    role: {
      type: String,
      required: true,
      enum: ROLES,
      default: 'viewer'
    },
    status: {
      type: String,
      required: true,
      enum: STATUSES,
      default: 'active'
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.ROLES = ROLES;
module.exports.STATUSES = STATUSES;
