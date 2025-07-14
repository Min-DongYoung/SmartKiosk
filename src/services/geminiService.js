// src/services/geminiService.js
import axios from 'axios';
import { GEMINI_API_KEY } from '../config';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// 현재 시간 정보 가져오기
const getCurrentTimeInfo = () => {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1;
  const day = now.getDay(); // 0: 일요일, 6: 토요일
  
  let timeOfDay = '오전';
  let mealTime = '아침';
  let rushHour = false;
  
  if (hour >= 12 && hour < 17) {
    timeOfDay = '오후';
    mealTime = '점심';
    rushHour = hour >= 12 && hour <= 13;
  } else if (hour >= 17) {
    timeOfDay = '저녁';
    mealTime = '저녁';
    rushHour = hour >= 18 && hour <= 19;
  } else if (hour >= 7 && hour <= 9) {
    rushHour = true;
  }
  
  const season = month >= 3 && month <= 5 ? '봄' :
                 month >= 6 && month <= 8 ? '여름' :
                 month >= 9 && month <= 11 ? '가을' : '겨울';
  
  const isWeekend = day === 0 || day === 6;
  
  return { hour, timeOfDay, mealTime, season, rushHour, isWeekend };
};

// 대화 히스토리 포맷팅
const formatConversationHistory = (history) => {
  if (!history || history.length === 0) return '';
  
  return history.map(entry => {
    if (typeof entry === 'string') {
      return entry;
    }
    return `${entry.role === 'user' ? '고객' : 'AI'}: ${entry.content}`;
  }).join('\n');
};

// 의도 분석을 위한 키워드
const INTENT_KEYWORDS = {
  confirm: ['네', '예', '맞아', '맞습니다', '확인', '오케이', 'ok', '좋아', '좋습니다'],
  cancel: ['아니', '아니요', '취소', '안할래', '그만', '삭제', '빼', '빼주'],
  modify: ['바꿔', '변경', '수정', '대신', '말고'],
  complete: ['끝', '완료', '결제', '계산', '마무리', '이제 그만'],
  more: ['더', '추가', '또', '그리고', '하나 더'],
  recommend: ['추천', '뭐가 좋', '뭐 먹을까', '메뉴 추천'],
  navigate: ['보여줘', '화면', '메뉴판', '장바구니 보여']
};

// 의도 파악 함수
const detectIntent = (text) => {
  const lowerText = text.toLowerCase();
  
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return intent;
    }
  }
  
  return null;
};

export const processVoiceWithGemini = async (
  voiceInput, 
  conversationHistory = [],
  contextInfo = {}
) => {
  // API 키 확인
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'my_api_key') {
    console.error('Gemini API 키가 설정되지 않았습니다.');
    return {
      success: false,
      action: 'error',
      response: '시스템 설정을 확인해주세요.',
      items: []
    };
  }

  const timeInfo = getCurrentTimeInfo();
  const conversationContext = formatConversationHistory(conversationHistory);
  const quickIntent = detectIntent(voiceInput);
  
  // 세션 상태에 따른 프롬프트 조정
  const sessionContext = contextInfo.sessionState === 'continuous' 
    ? '현재 연속 주문 모드입니다. 빠르고 간결하게 응답하세요.'
    : contextInfo.sessionState === 'waiting_confirm'
    ? '고객이 주문 확인을 기다리고 있습니다.'
    : '';

  const systemPrompt = `당신은 스마트 카페 키오스크 AI입니다.\n현재 상황:\n- 시간: ${timeInfo.timeOfDay} ${timeInfo.hour}시 (${timeInfo.mealTime}, ${timeInfo.season})\n- ${timeInfo.rushHour ? '혼잡 시간대' : '여유 시간대'}\n- ${timeInfo.isWeekend ? '주말' : '평일'}\n${sessionContext}\n\n메뉴 정보:\n[커피] 아메리카노(4000), 카페라떼(4500), 카푸치노(5000), 에스프레소(3000)\n[논커피] 초코라떼(5000), 그린티라떼(5500), 밀크티(4500)\n[디저트] 치즈케이크(6000), 초코케이크(5500), 크로플(4000)\n\n옵션: small(-500), medium(기본), large(+500) / hot, iced / 샷추가(+500), 시럽추가(+300), 휘핑추가(+500)\n\n${conversationContext ? `대화 기록:\n${conversationContext}\n` : ''}\n${contextInfo.cart?.items.length > 0 ? 
  `장바구니: ${contextInfo.cart.items.map(i => `${i.name} ${i.quantity}개`).join(', ')}\n` : ''}\n${contextInfo.pendingOrders?.length > 0 ? 
  `대기 주문: ${contextInfo.pendingOrders.map(o => o.summary).join(', ')}\n` : ''}\n\n상황별 응답 규칙:\n1. 단순 긍정("네", "예") → confirm 액션\n2. 단순 부정("아니요") → cancel 액션 (target: "last")\n3. 전체 취소 요청 → cancel 액션 (target: "all")\n4. 주문 완료/결제 요청 → complete 액션\n5. 연속 주문 → autoConfirm: true 설정\n6. 애매한 표현 → clarify 액션\n7. 화면 이동 요청 → navigate 액션 (screen 지정)\n\n응답 규칙:\n- 30자 이내로 간결하게\n- ${timeInfo.rushHour ? '신속한 처리 우선' : '친절한 안내 우선'}\n- 연속 주문시 빠른 확인 (autoConfirm: true)\n- 추천시 시간대와 날씨 고려\n\nJSON 형식:\n{\n  "success": true/false,\n  "action": "order|confirm|cancel|modify|complete|clarify|recommend|navigate|error",\n  "items": [{\n    "name": "메뉴명",\n    "temperature": "hot|iced", \n    "size": "small|medium|large",\n    "quantity": 수량,\n    "options": ["추가옵션"],\n    "price": 가격\n  }],\n  "totalPrice": 총액,\n  "response": "음성 응답",\n  "autoConfirm": true/false,\n  "target": "last|all|session",\n  "screen": "Cart|MenuList|Home",\n  "suggestions": ["추천1", "추천2"]\n}`;

  const userPrompt = `고객: "${voiceInput}"\n${quickIntent ? `(감지된 의도: ${quickIntent})` : ''}`;

  try {
    console.log('Gemini API 호출:', { 
      voiceInput, 
      quickIntent,
      sessionState: contextInfo.sessionState,
      pendingOrders: contextInfo.pendingOrders?.length || 0
    });
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}\n\nJSON으로만 응답:`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    );

    // 응답 파싱
    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response structure');
    }

    const generatedText = response.data.candidates[0].content.parts[0].text;
    console.log('Gemini 응답:', generatedText);
    
    // JSON 추출 및 파싱
    let parsed;
    try {
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||
                       generatedText.match(/```\s*([\s\S]*?)\s*```/) ||
                       generatedText.match(/(\{[\s\S]*\})/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found');
      }
      
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      parsed = JSON.parse(jsonStr);
      
    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError);
      
      // 빠른 의도 기반 폴백 응답
      if (quickIntent) {
        switch (quickIntent) {
          case 'confirm':
            return {
              success: true,
              action: 'confirm',
              items: [],
              response: '네, 확인했습니다.',
              totalPrice: 0
            };
          case 'cancel':
            return {
              success: true,
              action: 'cancel',
              target: 'last',
              items: [],
              response: '취소하겠습니다.',
              totalPrice: 0
            };
          case 'complete':
            return {
              success: true,
              action: 'complete',
              items: [],
              response: '주문을 완료하겠습니다.',
              totalPrice: 0
            };
          default:
            break;
        }
      }
      
      return {
        success: false,
        action: 'clarify',
        items: [],
        response: '다시 한번 말씀해 주세요.',
        totalPrice: 0
      };
    }
    
    // 응답 검증 및 보강
    const validatedResponse = {
      success: parsed.success !== false,
      action: parsed.action || 'order',
      items: Array.isArray(parsed.items) ? parsed.items.map(item => ({
        name: item.name || '',
        temperature: item.temperature || (timeInfo.season === '여름' ? 'iced' : 'hot'),
        size: item.size || 'medium',
        quantity: parseInt(item.quantity) || 1,
        options: Array.isArray(item.options) ? item.options : [],
        price: parseInt(item.price) || 0
      })) : [],
      totalPrice: parseInt(parsed.totalPrice) || 0,
      response: parsed.response || '처리했습니다.',
      autoConfirm: parsed.autoConfirm || false,
      target: parsed.target,
      screen: parsed.screen,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    };
    
    // 연속 주문 모드에서 자동 확인
    if (contextInfo.sessionState === 'continuous' && validatedResponse.action === 'order') {
      validatedResponse.autoConfirm = true;
    }
    
    console.log('최종 응답:', validatedResponse);
    return validatedResponse;
    
  } catch (error) {
    console.error('Gemini API 오류:', error);
    
    // 에러 타입별 처리
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        success: false,
        action: 'error',
        items: [],
        response: '응답이 느립니다. 다시 시도하겠습니다.',
        totalPrice: 0
      };
    }
    
    if (error.response?.status === 429) {
      // Rate limit - 간단한 처리로 전환
      if (quickIntent === 'confirm') {
        return {
          success: true,
          action: 'confirm',
          items: [],
          response: '확인했습니다.',
          totalPrice: 0
        };
      }
      
      return {
        success: false,
        action: 'error',
        items: [],
        response: '잠시만 기다려주세요.',
        totalPrice: 0
      };
    }
    
    return {
      success: false,
      action: 'error',
      items: [],
      response: '다시 말씀해주세요.',
      totalPrice: 0
    };
  }
};

// 추천 메뉴 생성
export const getRecommendations = async (context = {}) => {
  const timeInfo = getCurrentTimeInfo();
  
  // 시간대별 추천 로직
  const recommendations = [];
  
  if (timeInfo.mealTime === '아침') {
    recommendations.push({
      name: '아메리카노',
      reason: '상쾌한 아침을 위한 클래식 선택',
      temperature: 'hot'
    });
    recommendations.push({
      name: '카페라떼',
      reason: '부드러운 아침 시작',
      temperature: 'hot'
    });
  } else if (timeInfo.mealTime === '점심' && timeInfo.season === '여름') {
    recommendations.push({
      name: '아이스 아메리카노',
      reason: '더운 날씨에 시원한 커피',
      temperature: 'iced'
    });
    recommendations.push({
      name: '초코라떼',
      reason: '달콤한 디저트 음료',
      temperature: 'iced'
    });
  } else if (timeInfo.mealTime === '저녁') {
    recommendations.push({
      name: '밀크티',
      reason: '저녁에 부담없는 음료',
      temperature: 'hot'
    });
    recommendations.push({
      name: '치즈케이크',
      reason: '하루를 마무리하는 달콤함',
      temperature: null
    });
  }
  
  // 날씨 기반 추가
  if (timeInfo.season === '여름') {
    recommendations.forEach(rec => {
      if (rec.temperature) rec.temperature = 'iced';
    });
  }
  
  return recommendations;
};

// API 연결 테스트
export const testGeminiConnection = async () => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'my_api_key') {
    return { success: false, error: 'API_KEY_MISSING' };
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: "Respond with: OK"
          }]
        }]
      },
      { timeout: 5000 }
    );
    
    if (response.data?.candidates?.[0]?.content) {
      console.log('Gemini 연결 성공');
      return { success: true };
    }
    
    return { success: false, error: 'INVALID_RESPONSE' };
    
  } catch (error) {
    console.error('Gemini 연결 실패:', error.message);
    return { 
      success: false, 
      error: error.response?.status === 403 ? 'INVALID_API_KEY' : 'CONNECTION_ERROR' 
    };
  }
};