// testGeminiAPI.js
const axios = require('axios');

const API_KEY = 'my_api_key'; // 실제 API 키 입력

async function testGeminiAPI() {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        contents: [{
          parts: [{
            text: "Hello, test"
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('API 테스트 성공:', response.data);
  } catch (error) {
    console.error('API 테스트 실패:', error.response?.data || error.message);
  }
}

testGeminiAPI();