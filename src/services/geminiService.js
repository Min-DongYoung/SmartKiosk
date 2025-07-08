import axios from 'axios';

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // 임의의 값으로 설정
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const processVoiceCommand = async voiceInput => {
  const prompt = `
당신은 카페 키오스크 AI 어시스턴트입니다.
사용자의 음성 주문을 분석하여 JSON 형식으로 변환해주세요.

사용자 입력: "${voiceInput}"

다음 형식으로 응답하세요:
{
  "action": "주문/수정/취소/조회",
  "items": [
    {
      "menu": "메뉴명",
      "temperature": "hot/iced",
      "size": "small/medium/large",
      "quantity": 수량
    }
  ],
  "response": "사용자에게 할 음성 응답"
}
`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    return JSON.parse(generatedText);
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw error;
  }
};
