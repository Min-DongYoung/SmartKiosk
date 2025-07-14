import VoiceLog from '../models/VoiceLog.js';
import Menu from '../models/Menu.js';
import axios from 'axios';

// Gemini API 설정
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const processVoiceCommand = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { 
      voiceInput, 
      sessionId, 
      conversationHistory, 
      contextInfo 
    } = req.body;
    
    // 메뉴 정보 가져오기
    const menus = await Menu.find({ isAvailable: true });
    const menuInfo = menus.map(m => ({
      name: m.name,
      price: m.price,
      category: m.category,
      temperatureOptions: m.temperatureOptions,
      sizeOptions: m.sizeOptions
    }));
    
    // Gemini API 호출을 위한 프롬프트 생성
    const systemPrompt = createSystemPrompt(menuInfo, contextInfo);
    
    // Gemini API 호출
    const geminiResponse = await callGeminiAPI(systemPrompt, voiceInput, conversationHistory);
    
    // 처리 결과 파싱
    const processedCommand = parseGeminiResponse(geminiResponse);
    
    // 음성 로그 저장
    const voiceLog = await VoiceLog.create({
      sessionId,
      voiceInput,
      processedCommand,
      geminiResponse,
      processingTime: Date.now() - startTime,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });
    
    // 응답 전송
    res.json({
      success: true,
      data: processedCommand,
      sessionId,
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    console.error('음성 처리 오류:', error);
    
    // 오류 로그 저장
    await VoiceLog.create({
      sessionId: req.body.sessionId,
      voiceInput: req.body.voiceInput,
      error: error.message,
      processingTime: Date.now() - startTime
    });
    
    res.status(500).json({
      success: false,
      error: '음성 명령을 처리할 수 없습니다',
      message: error.message
    });
  }
};

export const getSessionLogs = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const logs = await VoiceLog.find({ sessionId })
      .sort({ createdAt: 1 })
      .select('-geminiResponse');
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getVoiceLogs = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      hasError,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const filter = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    if (hasError === 'true') {
      filter.error = { $exists: true };
    }
    
    const logs = await VoiceLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('orderId', 'orderNumber status');
    
    const count = await VoiceLog.countDocuments(filter);
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getVoiceStats = async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    
    const dateFilter = getDateFilter(period);
    
    const stats = await VoiceLog.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: null,
          totalCommands: { $sum: 1 },
          successfulCommands: {
            $sum: {
              $cond: [{ $eq: ['$processedCommand.success', true] }, 1, 0]
            }
          },
          averageProcessingTime: { $avg: '$processingTime' },
          uniqueSessions: { $addToSet: '$sessionId' },
          actionBreakdown: {
            $push: '$processedCommand.action'
          }
        }
      },
      {
        $project: {
          totalCommands: 1,
          successfulCommands: 1,
          successRate: {
            $multiply: [
              { $divide: ['$successfulCommands', '$totalCommands'] },
              100
            ]
          },
          averageProcessingTime: { $round: ['$averageProcessingTime', 0] },
          uniqueSessionCount: { $size: '$uniqueSessions' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats[0] || {
        totalCommands: 0,
        successfulCommands: 0,
        successRate: 0,
        averageProcessingTime: 0,
        uniqueSessionCount: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 헬퍼 함수들
function createSystemPrompt(menuInfo, contextInfo) {
  const menuList = menuInfo.map(m => 
    `${m.name}(${m.price}원, ${m.category})`
  ).join(', ');
  
  return `당신은 스마트 카페 키오스크 AI입니다.
메뉴: ${menuList}
현재 장바구니: ${contextInfo.cart?.items?.length || 0}개 항목
세션 상태: ${contextInfo.sessionState || 'idle'}

사용자의 음성 명령을 다음 JSON 형식으로 변환하세요:
{
  "success": true,
  "action": "order|confirm|cancel|modify|complete|recommend",
  "items": [{"name": "메뉴명", "quantity": 1, "size": "medium", "temperature": "hot"}],
  "response": "사용자에게 전달할 응답",
  "totalPrice": 0
}`;
}

async function callGeminiAPI(systemPrompt, userInput, conversationHistory = []) {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n대화 기록:\n${conversationHistory.join('\n')}\n\n사용자: ${userInput}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        }
      },
      {
        timeout: 8000
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw new Error('AI 처리 중 오류가 발생했습니다');
  }
}

function parseGeminiResponse(responseText) {
  try {
    // JSON 추출
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('유효한 JSON 응답을 찾을 수 없습니다');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // 기본값 설정
    return {
      success: parsed.success !== false,
      action: parsed.action || 'error',
      items: Array.isArray(parsed.items) ? parsed.items : [],
      response: parsed.response || '처리할 수 없습니다',
      totalPrice: parsed.totalPrice || 0
    };
  } catch (error) {
    console.error('응답 파싱 오류:', error);
    return {
      success: false,
      action: 'error',
      items: [],
      response: '응답을 처리할 수 없습니다',
      totalPrice: 0
    };
  }
}

function getDateFilter(period) {
  const now = new Date();
  
  switch (period) {
    case 'hour':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}