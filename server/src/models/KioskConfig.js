import mongoose from 'mongoose';

const kioskConfigSchema = new mongoose.Schema({
  kioskId: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  features: {
    voiceEnabled: { type: Boolean, default: true },
    multiLanguage: { type: Boolean, default: false },
    membershipEnabled: { type: Boolean, default: true }
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  lastMaintenance: Date,
  settings: {
    currency: { type: String, default: 'KRW' },
    taxRate: { type: Number, default: 0.1 },
    sessionTimeout: { type: Number, default: 30000 }, // 밀리초
    maxOrderItems: { type: Number, default: 20 },
    voiceLanguage: { type: String, default: 'ko-KR' }
  }
}, {
  timestamps: true
});

export default mongoose.model('KioskConfig', kioskConfigSchema);