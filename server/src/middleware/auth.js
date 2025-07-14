// 실제 프로덕션에서는 JWT 등을 사용한 인증 구현 필요
export const authenticate = (req, res, next) => {
  // 임시 구현 - 헤더에서 토큰 확인
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }
  
  // TODO: JWT 검증 로직 구현
  req.user = { id: 'admin', role: 'admin' };
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: '관리자 권한이 필요합니다'
    });
  }
  next();
};