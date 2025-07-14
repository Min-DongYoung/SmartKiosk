import mongoose from 'mongoose';

const voiceLogSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  voiceInput: {
    type: String,
    required: true
  },
  processedCommand: {
    action: String,
    items: Array,
    response: String,
    success: Boolean
  },
  geminiResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  processingTime: {
    type: Number // 밀리초
  },
  error: {
    type: String
  },
  userAgent: String,
  ipAddress: String
}, {
  timestamps: true
});

// 세션별 인덱스
voiceLogSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.model('VoiceLog', voiceLogSchema);