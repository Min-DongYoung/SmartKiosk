export const login = async (req, res) => {
  const { username, password } = req.body;

  // 임시 인증: 실제 환경에서는 DB에서 사용자 정보를 확인하고 JWT 등을 발급해야 합니다.
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      message: '로그인 성공',
      token: 'fake-jwt-token', // 임시 토큰
      user: { id: 'admin', username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({ success: false, error: '잘못된 사용자 이름 또는 비밀번호' });
  }
};

export const logout = (req, res) => {
  // 클라이언트에서 토큰을 삭제하는 것으로 처리
  res.json({ success: true, message: '로그아웃 성공' });
};

export const getMe = (req, res) => {
  // 토큰 검증 후 사용자 정보 반환 (현재는 임시)
  res.json({ success: true, user: { id: 'admin', username: 'admin', role: 'admin' } });
};