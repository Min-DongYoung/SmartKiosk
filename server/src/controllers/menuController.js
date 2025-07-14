import Menu from '../models/Menu.js';
import { uploadImage } from '../utils/imageUpload.js';

export const getAllMenus = async (req, res) => {
  try {
    const { available = true } = req.query;
    const filter = available === 'all' ? {} : { isAvailable: available === 'true' };
    
    console.log('getAllMenus - 적용된 필터:', filter); // 로그 추가

    const menus = await Menu.find(filter)
      .sort({ category: 1, name: 1 });
    
    console.log('getAllMenus - 조회된 메뉴 수:', menus.length); // 로그 추가

    res.json({
      success: true,
      data: menus,
      count: menus.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getMenusByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const menus = await Menu.find({ 
      category,
      isAvailable: true 
    });
    
    res.json({
      success: true,
      data: menus,
      count: menus.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    if (!menu) {
      return res.status(404).json({ 
        success: false, 
        error: '메뉴를 찾을 수 없습니다' 
      });
    }
    
    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const searchMenus = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    
    let filter = { isAvailable: true };
    
    if (q) {
      filter.$text = { $search: q };
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    const menus = await Menu.find(filter)
      .sort({ score: { $meta: 'textScore' } });
    
    res.json({
      success: true,
      data: menus,
      count: menus.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const createMenu = async (req, res) => {
  try {
    const menuData = req.body;
    
    // 이미지 업로드 처리
    if (req.file) {
      menuData.imageUrl = await uploadImage(req.file);
    }
    
    const menu = await Menu.create(menuData);
    
    res.status(201).json({
      success: true,
      data: menu
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!menu) {
      return res.status(404).json({ 
        success: false, 
        error: '메뉴를 찾을 수 없습니다' 
      });
    }
    
    // WebSocket으로 실시간 알림
    req.io.to('menu-updates').emit('menu:updated', {
      action: 'update',
      menu: menu
    });
    
    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    
    if (!menu) {
      return res.status(404).json({ 
        success: false, 
        error: '메뉴를 찾을 수 없습니다' 
      });
    }
    
    res.json({
      success: true,
      message: '메뉴가 삭제되었습니다'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    if (!menu) {
      return res.status(404).json({ 
        success: false, 
        error: '메뉴를 찾을 수 없습니다' 
      });
    }
    
    menu.isAvailable = !menu.isAvailable;
    await menu.save();
    
    // WebSocket으로 실시간 알림 - 품절 상태 변경은 중요!
    req.io.to('menu-updates').emit('menu:availability', {
      menuId: menu._id,
      menuName: menu.name,
      isAvailable: menu.isAvailable,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};