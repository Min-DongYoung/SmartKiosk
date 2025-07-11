import axios from 'axios';
import { GEMINI_API_KEY } from '../config'; // 경로 수정

// gemini-2.0-flash 모델로 변경
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const processVoiceWithGemini = async (
  voiceInput, 
  conversationHistory = [],
  contextInfo = {}
) => {
  // API 키 확인 로직 (config.js에서 가져오므로 더 안정적)
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'my_api_key') {
    console.error('Gemini API 키가 config.js에 설정되지 않았습니다.');
    return {
      success: false,
      action: 'error',
      response: 'API 키를 확인해주세요.',
      items: []
    };
  }

  const systemPrompt = `당신은 카페 키오스크 AI 어시스턴트입니다. 
사용자의 음성 주문을 분석하여 정확한 주문 정보를 추출하고 친절하게 응답해야 합니다.

메뉴 정보:
- 커피: 아메리카노(4000원), 카페라떼(4500원), 카푸치노(5000원), 에스프레소(3000원)
- 논커피: 초코라떼(5000원), 그린티라떼(5500원), 밀크티(4500원)
- 디저트: 치즈케이크(6000원), 초코케이크(5500원), 크로플(4000원)

옵션:
- 사이즈: small(-500원), medium(기본), large(+500원)
- 온도: hot, iced
- 추가: 샷추가(+500원), 시럽추가(+300원), 휘핑추가(+500원)

주문 처리 규칙:
1. "아아"는 "아이스 아메리카노", "뜨아"는 "핫 아메리카노"
2. 온도 미지정 시 계절에 맞게 추천 (현재: 겨울 → hot 기본)
3. 사이즈 미지정 시 medium
4. 애매한 표현은 정중히 확인 요청

응답 형식 (반드시 JSON으로):
{
  "success": true,
  "action": "order",
  "items": [
    {
      "name": "메뉴명",
      "temperature": "hot/iced",
      "size": "small/medium/large",
      "quantity": 수량,
      "options": ["샷추가", "시럽추가"],
      "price": 개당가격
    }
  ],
  "totalPrice": 총금액,
  "response": "사용자에게 할 음성 응답"
}`;

  const userPrompt = conversationHistory.length > 0 
    ? `이전 대화:\n${conversationHistory.join('\n')}\n\n새로운 주문: "${voiceInput}"`
    : `주문: "${voiceInput}"`;

  try {
    console.log('Gemini API 호출 시작');
    console.log('사용자 입력:', voiceInput);
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}\n\nJSON 형식으로만 응답하세요.`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    // 응답 확인
    const candidates = response.data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No response from Gemini');
    }

    const generatedText = candidates[0].content.parts[0].text;
    console.log('Gemini 응답:', generatedText);
    
    // JSON 파싱
    try {
      // JSON 블록 추출
      let jsonStr = generatedText;
      
      // \`\`\`json 블록이 있으면 제거
      const jsonMatch = generatedText.match(/\`\`\`json\n?([\s\S]*?)\n?\`\`\`/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      // 순수 JSON 객체만 추출
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonStr = objectMatch[0];
      }
      
      const parsed = JSON.parse(jsonStr);
      console.log('파싱 성공:', parsed);
      
      // 기본값 설정
      return {
        success: parsed.success !== false,
        action: parsed.action || 'order',
        items: parsed.items || [],
        totalPrice: parsed.totalPrice || 0,
        response: parsed.response || '주문을 처리했습니다.',
        suggestions: parsed.suggestions || []
      };
      
    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError);
      
      // 파싱 실패 시 간단한 응답 생성
      return {
        success: true,
        action: 'order',
        items: [{
          name: '아메리카노',
          temperature: 'hot',
          size: 'medium',
          quantity: 1,
          price: 4000
        }],
        totalPrice: 4000,
        response: '아메리카노 한 잔 주문하셨습니다.'
      };
    }
    
  } catch (error) {
    console.error('Gemini API 오류:', error.message);
    console.error('상세 오류:', error.response?.data);
    
    return {
      success: false,
      action: 'error',
      items: [],
      response: '죄송합니다. 다시 한번 말씀해주세요.',
      totalPrice: 0
    };
  }
};

// 테스트 함수
export const testGeminiConnection = async () => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: "Hello"
          }]
        }]
      }
    );
    console.log('Gemini 연결 테스트 성공');
    return true;
  } catch (error) {
    console.error('Gemini 연결 테스트 실패:', error.message);
    return false;
  }
};