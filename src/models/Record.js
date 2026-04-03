const mongoose = require('mongoose');

const TYPES = ['income', 'expense'];

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      required: true,
      enum: TYPES
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    date: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

recordSchema.index({ date: -1 });
recordSchema.index({ category: 1 });
recordSchema.index({ type: 1 });

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;
module.exports.TYPES = TYPES;
