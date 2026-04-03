const Record = require('../models/Record');

function toRecordDto(record) {
  return {
    id: String(record._id),
    amount: record.amount,
    type: record.type,
    category: record.category,
    date: record.date,
    notes: record.notes,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

async function createRecord(req, res) {
  const record = await Record.create({
    amount: req.body.amount,
    type: req.body.type,
    category: req.body.category,
    date: req.body.date,
    notes: req.body.notes,
    createdBy: req.user.id
  });

  const populated = await Record.findById(record._id).populate('createdBy', 'name email role').lean();
  return res.status(201).json({ data: toRecordDto(populated) });
}

async function listRecords(req, res) {
  const filter = {};

  if (req.query.type) {
    filter.type = req.query.type;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.startDate || req.query.endDate) {
    filter.date = {};
    if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
  }

  const limit = Math.min(Number(req.query.limit || 50), 200);
  const skip = Math.max(Number(req.query.skip || 0), 0);

  const [items, total] = await Promise.all([
    Record.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email role')
      .lean(),
    Record.countDocuments(filter)
  ]);

  return res.json({
    data: items.map((r) => toRecordDto(r)),
    meta: { total, limit, skip }
  });
}

async function updateRecord(req, res) {
  const updates = {
    amount: req.body.amount,
    type: req.body.type,
    category: req.body.category,
    date: req.body.date,
    notes: req.body.notes
  };

  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

  const record = await Record.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  })
    .populate('createdBy', 'name email role')
    .lean();

  if (!record) {
    return res.status(404).json({ message: 'Record not found' });
  }

  return res.json({ data: toRecordDto(record) });
}

async function deleteRecord(req, res) {
  const record = await Record.findByIdAndDelete(req.params.id);
  if (!record) {
    return res.status(404).json({ message: 'Record not found' });
  }

  return res.status(204).send();
}

module.exports = {
  createRecord,
  listRecords,
  updateRecord,
  deleteRecord
};
