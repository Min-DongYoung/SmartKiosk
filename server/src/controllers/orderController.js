import Order from '../models/Order.js';
import Menu from '../models/Menu.js';
import { sendOrderNotification } from '../utils/notifications.js';

export const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, isVoiceOrder, voiceSessionId, customerInfo } = req.body;
    
    // 메뉴 유효성 검증 및 가격 계산
    let totalAmount = 0;
    const processedItems = [];
    
    for (const item of items) {
      const menu = await Menu.findById(item.menuId);
      if (!menu || !menu.isAvailable) {
        return res.status(400).json({
          success: false,
          error: `메뉴 ${item.name}을(를) 주문할 수 없습니다`
        });
      }
      
      // 가격 재계산
      let itemPrice = menu.price;
      if (item.options.size === 'small') itemPrice -= 500;
      if (item.options.size === 'large') itemPrice += 500;
      
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;
      
      processedItems.push({
        menuId: menu._id,
        name: menu.name,
        price: itemPrice,
        quantity: item.quantity,
        options: item.options,
        totalPrice: itemTotal
      });
    }
    
    // 주문 생성
    const order = await Order.create({
      items: processedItems,
      totalAmount,
      paymentMethod,
      isVoiceOrder,
      voiceSessionId,
      customerInfo
    });
    
    // 알림 전송 (주방 시스템 등)
    await sendOrderNotification(order);

    // WebSocket으로 실시간 알림
    req.io.to('order-updates').emit('newOrder', { type: 'newOrder', order: order });
    
    res.status(201).json({
      success: true,
      data: order,
      message: `주문번호: ${order.orderNumber}`
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      orderNumber: req.params.orderNumber 
    }).populate('items.menuId');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: '주문을 찾을 수 없습니다' 
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuId');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: '주문을 찾을 수 없습니다' 
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'completed' && { completedAt: new Date() })
      },
      { new: true })
      .populate('items.menuId'); // populate 추가
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: '주문을 찾을 수 없습니다' 
      });
    }

    // WebSocket으로 실시간 알림
    req.io.to('order-updates').emit('order:updated', { type: 'orderUpdated', order: order });
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: '주문을 찾을 수 없습니다' 
      });
    }
    
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: '이미 완료되거나 취소된 주문입니다' 
      });
    }
    
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason;
    await order.save();

    // WebSocket으로 실시간 알림
    req.io.to('order-updates').emit('order:cancelled', { type: 'orderCancelled', order: order });
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.menuId');
    
    const count = await Order.countDocuments(filter);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          voiceOrders: {
            $sum: { $cond: ['$isVoiceOrder', 1, 0] }
          },
          ordersByStatus: {
            $push: '$status'
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        voiceOrders: 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};