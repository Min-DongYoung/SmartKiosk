import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    // required: true, // seedMenu.js에 description이 없으므로 required 제거
    trim: true
  },
  category: {
    type: String,
    required: true,
    // seedMenu.js의 카테고리에 맞게 enum 확장
    enum: ['커피', '에이드', '스무디', '티', '라떼', '디저트'] 
  },
  imageUrl: {
    type: String,
    default: '/uploads/default.jpg', // 기본 이미지
  },
  temperatureOptions: [{ // options.temperature -> temperatureOptions 변경
    type: String,
    enum: ['hot', 'iced']
  }],
  sizeOptions: [{ // options.size -> sizeOptions 변경
    type: String,
    enum: ['small', 'medium', 'large', 'piece', 'cup'] // seedMenu.js에 piece, cup 추가
  }],
  extras: [{ // seedMenu.js에 extras가 없으므로 required 제거
    name: String,
    price: Number
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [String],
  nutritionInfo: {
    calories: Number,
    caffeine: Number,
    sugar: Number
  },
  adminPriority: { // 새 필드 추가
    type: Number,
    default: null
  },
  popularity: { // 새 필드 추가
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 인덱스 설정
menuSchema.index({ category: 1, isAvailable: 1 });
menuSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Menu', menuSchema);