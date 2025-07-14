// 주문 알림 시스템 (예: 주방 디스플레이, 관리자 알림 등)
export const sendOrderNotification = async (order) => {
  try {
    // TODO: 실제 알림 시스템 구현
    // - WebSocket을 통한 실시간 알림
    // - 주방 프린터 출력
    // - 관리자 앱 푸시 알림
    
    console.log(`새 주문 알림: ${order.orderNumber}`);
    
    // 임시로 콘솔에만 출력
    return true;
  } catch (error) {
    console.error('주문 알림 전송 실패:', error);
    return false;
  }
};