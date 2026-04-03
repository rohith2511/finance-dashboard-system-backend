const { getSummary } = require('../services/dashboardService');

async function summary(req, res) {
  const result = await getSummary({
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    recentLimit: req.query.recentLimit
  });

  return res.json({ data: result });
}

module.exports = { summary };
