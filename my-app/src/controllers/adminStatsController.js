// Controller to aggregate total chapters read by all users per day
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get total chapters read by all users per day for the current month
const getChaptersReadByDate = async (req, res) => {
  try {
    const { userHistoryCollection } = getDB();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Aggregate by updatedAt date
    const pipeline = [
      { $match: { updatedAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];
    const results = await userHistoryCollection.aggregate(pipeline).toArray();
    const chapters = results.map(r => ({ date: r._id, count: r.count }));
    res.json({ success: true, chapters });
  } catch (error) {
    console.error('Error fetching chapters read stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching chapters read stats' });
  }
};

module.exports = { getChaptersReadByDate };
