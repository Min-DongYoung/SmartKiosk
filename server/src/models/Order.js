import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  options: {
    size: String,
    temperature: String,
    extras: [String]
  },
  totalPrice: Number
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'mobile'],
    required: true
  },
  isVoiceOrder: {
    type: Boolean,
    default: false
  },
  voiceSessionId: String,
  customerInfo: {
    phoneNumber: String,
    membershipId: String
  },
  estimatedTime: {
    type: Number, // 분 단위
    default: 10
  },
  completedAt: Date,
  cancelledAt: Date,
  cancelReason: String
}, {
  timestamps: true
});

// 주문번호 생성 미들웨어
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });
    this.orderNumber = `${dateStr}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);