import KioskConfig from '../models/KioskConfig.js';

export const getConfig = async (req, res) => {
  try {
    const config = await KioskConfig.findOne({ kioskId: 'KIOSK001' });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: '키오스크 설정을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getOperatingStatus = async (req, res) => {
  try {
    const config = await KioskConfig.findOne({ kioskId: 'KIOSK001' });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: '키오스크 설정을 찾을 수 없습니다'
      });
    }
    
    // 현재 운영 상태 확인
    const now = new Date();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const todayHours = config.operatingHours[currentDay];
    const isOpen = config.isActive && 
                   !config.maintenanceMode && 
                   todayHours && 
                   currentTime >= todayHours.open && 
                   currentTime <= todayHours.close;
    
    res.json({
      success: true,
      data: {
        isOpen,
        currentTime,
        todayHours,
        maintenanceMode: config.maintenanceMode,
        message: config.maintenanceMode 
          ? '시스템 점검 중입니다' 
          : isOpen 
            ? '정상 영업 중입니다' 
            : '영업 시간이 아닙니다'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const config = await KioskConfig.findOneAndUpdate(
      { kioskId: 'KIOSK001' },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: '키오스크 설정을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const toggleMaintenanceMode = async (req, res) => {
  try {
    const config = await KioskConfig.findOne({ kioskId: 'KIOSK001' });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: '키오스크 설정을 찾을 수 없습니다'
      });
    }
    
    config.maintenanceMode = !config.maintenanceMode;
    if (config.maintenanceMode) {
      config.lastMaintenance = new Date();
    }
    
    await config.save();
    
    res.json({
      success: true,
      data: {
        maintenanceMode: config.maintenanceMode,
        message: config.maintenanceMode 
          ? '유지보수 모드가 활성화되었습니다' 
          : '유지보수 모드가 비활성화되었습니다'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};