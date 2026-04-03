const Record = require('../models/Record');

function clampRecentLimit(limit) {
  const n = Number(limit || 10);
  if (Number.isNaN(n)) return 10;
  return Math.max(1, Math.min(n, 50));
}

async function getSummary({ startDate, endDate, recentLimit } = {}) {
  const match = {};

  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const recentN = clampRecentLimit(recentLimit);

  const totalsAgg = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        }
      }
    }
  ]);

  const totalIncome = totalsAgg[0]?.totalIncome || 0;
  const totalExpense = totalsAgg[0]?.totalExpense || 0;
  const netBalance = totalIncome - totalExpense;

  const categoryAgg = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' }
      }
    }
  ]);

  const categoryMap = new Map();
  for (const row of categoryAgg) {
    const category = row._id.category;
    const type = row._id.type;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, { category, income: 0, expense: 0, net: 0 });
    }

    const entry = categoryMap.get(category);
    if (type === 'income') entry.income = row.total;
    if (type === 'expense') entry.expense = row.total;
    entry.net = entry.income - entry.expense;
  }

  const categoryWiseTotals = Array.from(categoryMap.values()).sort((a, b) =>
    a.category.localeCompare(b.category)
  );

  const recentTransactions = await Record.find(match)
    .sort({ date: -1, createdAt: -1 })
    .limit(recentN)
    .populate('createdBy', 'name email role')
    .lean();

  const rollingStart = new Date();
  rollingStart.setDate(1);
  rollingStart.setHours(0, 0, 0, 0);
  rollingStart.setMonth(rollingStart.getMonth() - 11);

  let monthlyStart = rollingStart;
  if (match.date?.$gte && match.date.$gte > monthlyStart) {
    monthlyStart = match.date.$gte;
  }

  const monthlyMatch = {
    ...match,
    date: {
      $gte: monthlyStart,
      ...(match.date?.$lte ? { $lte: match.date.$lte } : {})
    }
  };

  const monthlyAgg = await Record.aggregate([
    { $match: monthlyMatch },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const monthlyMap = new Map();
  for (const row of monthlyAgg) {
    const key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        month: key,
        income: 0,
        expense: 0,
        net: 0
      });
    }
    const entry = monthlyMap.get(key);
    if (row._id.type === 'income') entry.income = row.total;
    if (row._id.type === 'expense') entry.expense = row.total;
    entry.net = entry.income - entry.expense;
  }

  const monthlySummary = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalIncome,
    totalExpense,
    netBalance,
    categoryWiseTotals,
    recentTransactions,
    monthlySummary
  };
}

module.exports = { getSummary };
