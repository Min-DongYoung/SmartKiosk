import React, { createContext, useState, useEffect, useContext } from 'react';
import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';
import { processVoiceWithGemini } from '../services/geminiService';
import { CartContext } from './CartContext';

export const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [error, setError] = useState('');
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [recognizedTextTimer, setRecognizedTextTimer] = useState(null);
  const { addToCart, cartItems } = useContext(CartContext);

  const clearRecognizedText = () => {
    setRecognizedText('');
  };

  useEffect(() => {
    // TTS 초기 설정
    Tts.setDefaultLanguage('ko-KR');
    Tts.setDefaultRate(0.5);

    // Voice 이벤트 리스너 설정
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    console.log('음성 인식 시작');
    setError('');
    setRecognizedText('');
  };

  const onSpeechEnd = () => {
    console.log('음성 인식 종료');
    setIsListening(false);
  };

  const onSpeechError = (error) => {
    console.log('음성 인식 오류:', error);
    setError(error.error);
    setIsListening(false);
    Tts.speak('음성 인식에 실패했습니다. 다시 시도해주세요.');
  };

  const onSpeechResults = (event) => {
    const text = event.value[0];
    setRecognizedText(text);

    // 5초 후 recognizedText 초기화
    if (recognizedTextTimer) {
      clearTimeout(recognizedTextTimer);
    }
    const timer = setTimeout(() => {
      setRecognizedText('');
    }, 5000); // 5초
    setRecognizedTextTimer(timer);
  };

  const onSpeechPartialResults = (event) => {
    setRecognizedText(event.value[0]);
    
    // 기존 타이머 취소
    if (silenceTimer) {
      clearTimeout(silenceTimer);
    }
    
    // 2초 후 자동 종료
    const timer = setTimeout(() => {
      if (isListening) {
        stopListening();
      }
    }, 2000);
    
    setSilenceTimer(timer);
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start('ko-KR');
    } catch (error) {
      console.error(error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error(error);
    }
  };

  const processCommand = async (voiceInput, navigation) => {
    setIsProcessing(true);
    
    try {
      // Gemini API 호출
      const result = await processVoiceWithGemini(voiceInput, conversationHistory);
      
      // 대화 히스토리 업데이트
      setConversationHistory(prev => [
        ...prev.slice(-4), // 최근 5개만 유지
        `사용자: ${voiceInput}`,
        `AI: ${result.response}`
      ]);
      
      // 액션 처리
      switch (result.action) {
        case 'order':
          // 장바구니에 추가
          result.items.forEach(item => {
            addToCart({
              id: Date.now() + Math.random(),
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              totalPrice: item.price * item.quantity, // totalPrice 추가
              options: {
                size: item.size,
                temperature: item.temperature,
                extras: item.options || []
              }
            });
          });
          
          // 장바구니로 이동
          if (result.items.length > 0) {
            setTimeout(() => navigation.navigate('Cart'), 1500);
          }
          break;
          
        case 'recommend':
          // 추천 메뉴 표시 (Phase 3에서 구현)
          break;
          
        case 'clarify':
          // 추가 질문 대기
          setTimeout(() => startListening(), 2000);
          break;
      }
      
      // TTS 응답
      Tts.speak(result.response);
      
    } catch (error) {
      console.error('Process command error:', error);
      Tts.speak('죄송합니다. 주문을 처리하는 중 문제가 발생했습니다. 다시 한 번 말씀해 주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <VoiceContext.Provider value={{
      isListening,
      isProcessing,
      recognizedText,
      conversationHistory,
      error,
      startListening,
      stopListening,
      processCommand,
      clearRecognizedText
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);