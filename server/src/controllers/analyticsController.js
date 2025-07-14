import Order from '../models/Order.js';

export const getPopularMenus = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const popularMenus = await Order.aggregate([
      { $unwind: '$items' },
      { 
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({ success: true, data: popularMenus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getHourlyStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hourlyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { 
        $group: {
          _id: { $hour: '$createdAt' },
          orderCount: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ success: true, data: hourlyStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};