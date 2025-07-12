import React, { createContext, useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';
import { AppState } from 'react-native';
import { processVoiceWithGemini, getRecommendations } from '../services/geminiService';
import { CartContext } from './CartContext';
import { navigate } from '../navigation/navigationService';

export const VoiceContext = createContext();

const SESSION_TIMEOUT = 30000; // 30초

export const VoiceProvider = ({ children }) => {
  const { addToCart, clearCart, removeItem, cartItems } = useContext(CartContext);

  // --- 상태 관리 ---
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  
  // 세션 및 대화 상태
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionState, setSessionState] = useState('idle'); // idle, continuous, waiting_confirm
  const [conversationHistory, setConversationHistory] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);

  // --- Ref 관리 ---
  const sessionTimerRef = useRef(null);
  const isMounted = useRef(true);

  // --- 음성 인식/TTS 초기화 및 이벤트 리스너 설정 ---
  useEffect(() => {
    const setupVoice = () => {
      Voice.onSpeechStart = () => {
        if (isMounted.current) {
          console.log('음성 인식 시작');
          setIsListening(true);
          setRecognizedText('');
        }
      };
      Voice.onSpeechEnd = () => {
        if (isMounted.current) {
          console.log('음성 인식 종료');
          setIsListening(false);
        }
      };
      Voice.onSpeechError = (e) => {
        if (isMounted.current) {
          console.error('음성 인식 오류:', e.error);
          setError(e.error?.message || '음성 인식 오류');
          speak('죄송합니다, 잘 듣지 못했어요. 다시 말씀해 주시겠어요?');
          setIsListening(false);
        }
      };
      Voice.onSpeechResults = (e) => {
        if (isMounted.current && e.value && e.value[0]) {
          console.log('음성 인식 결과:', e.value[0]);
          setRecognizedText(e.value[0]);
        }
      };
    };

    const teardownVoice = () => {
      Voice.destroy().catch(e => console.error('Voice 해제 오류:', e));
    };

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (isListening) {
          stopListening();
        }
        endSession();
      }
    };
    
    Tts.setDefaultLanguage('ko-KR');
    setupVoice();
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      isMounted.current = false;
      teardownVoice();
      appStateSubscription.remove();
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    };
  }, []);

  // --- 세션 관리 ---
  const startSession = useCallback(() => {
    if (sessionActive) {
      console.log('세션 갱신');
      clearTimeout(sessionTimerRef.current);
    } else {
      console.log('새로운 세션 시작');
      setSessionActive(true);
      setConversationHistory([]);
      setPendingOrders([]);
      setSessionState('idle');
      speak('안녕하세요! 무엇을 도와드릴까요?');
    }
    sessionTimerRef.current = setTimeout(endSession, SESSION_TIMEOUT);
  }, [sessionActive]);

  const endSession = useCallback(() => {
    console.log('세션 종료');
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    setSessionActive(false);
    setSessionState('idle');
    setIsListening(false);
    setIsProcessing(false);
    setRecognizedText('');
    if (cartItems.length > 0) {
        speak('주문이 완료되었습니다. 이용해주셔서 감사합니다.');
    }
  }, [cartItems]);

  // --- 음성 명령 처리 ---
  const startListening = async () => {
    if (isProcessing) return;
    try {
      await Voice.start('ko-KR');
      startSession();
    } catch (e) {
      console.error('음성 인식 시작 오류:', e);
      setError('마이크를 시작할 수 없습니다.');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('음성 인식 중지 오류:', e);
    } finally {
        setIsListening(false);
    }
  };

  const speak = (message) => {
    Tts.stop();
    Tts.speak(message);
  };



  const processCommand = useCallback(async (command) => {
    if (!command) return;

    setIsProcessing(true);
    startSession();

    const contextInfo = {
      cart: { items: cartItems, totalPrice: cartItems.reduce((sum, item) => sum + item.totalPrice, 0) },
      sessionState,
      pendingOrders,
    };

    setConversationHistory(prev => [...prev, { role: 'user', content: command }]);

    const result = await processVoiceWithGemini(command, conversationHistory, contextInfo);
    
    setConversationHistory(prev => [...prev, { role: 'assistant', content: result.response }]);
    
    speak(result.response);
    handleGeminiResponse(result);

    setIsProcessing(false);
  }, [cartItems, sessionState, pendingOrders, conversationHistory, startSession]);

  const handleGeminiResponse = (result) => {
    if (result.items && result.items.length > 1) {
        const [firstItem, ...remainingItems] = result.items;
        result.items = [firstItem];
        setPendingOrders(remainingItems.map(item => ({ ...item, summary: `${item.name} ${item.quantity}개` })));
    }

    switch (result.action) {
      case 'order':
        if (result.items && result.items.length > 0) {
          result.items.forEach(item => addToCart(item));
          if (result.autoConfirm) {
            setSessionState('continuous');
            speak('추가 주문이 있으신가요?');
          } else {
            setSessionState('waiting_confirm');
            speak('주문하시려면 "확인"이라고 말씀해주세요.');
          }
        }
        break;
      
      case 'confirm':
        if (pendingOrders.length > 0) {
            const orderToProcess = pendingOrders[0];
            addToCart(orderToProcess);
            const remaining = pendingOrders.slice(1);
            setPendingOrders(remaining);
            if (remaining.length > 0) {
                setSessionState('waiting_confirm');
                speak(`다음 주문 ${remaining[0].summary}을 추가할까요?`);
            } else {
                setSessionState('continuous');
                speak('모든 주문을 담았습니다. 추가 주문 있으신가요?');
            }
        } else {
            setSessionState('continuous');
        }
        break;

      case 'cancel':
        if (result.target === 'last' && cartItems.length > 0) {
          removeItem(cartItems[cartItems.length - 1].id);
        } else if (result.target === 'all') {
          clearCart();
        }
        break;

      case 'complete':
        endSession();
        navigate('Cart');
        break;

      case 'navigate':
        if (result.screen) {
          navigate(result.screen);
        }
        break;
      
      case 'recommend':
        showRecommendations();
        break;

      case 'clarify':
        setTimeout(() => startListening(), 1500);
        break;

      case 'error':
        break;

      default:
        break;
    }
    
    if (pendingOrders.length > 0 && sessionState !== 'waiting_confirm') {
        setSessionState('waiting_confirm');
        speak(`다음 주문으로 ${pendingOrders[0].summary}이 있습니다. 추가하시겠어요?`);
    }
  };

  const showRecommendations = async () => {
      const recommendations = await getRecommendations();
      if (recommendations && recommendations.length > 0) {
          navigate('RecommendationModal', { recommendations });
      } else {
          speak('죄송합니다, 지금은 추천해드릴 메뉴가 없네요.');
      }
  };
  
  const quickCommand = (command) => {
      setRecognizedText(command);
  };

  const clearRecognizedText = () => {
      setRecognizedText('');
  }

  const getSessionInfo = () => {
      return {
          active: sessionActive,
          state: sessionState,
          history: conversationHistory
      }
  }

  const value = useMemo(() => ({
    isListening,
    isProcessing,
    recognizedText,
    conversationHistory,
    error,
    sessionActive,
    sessionState,
    pendingOrders,
    startListening,
    stopListening,
    processCommand,
    clearRecognizedText,
    endSession,
    quickCommand,
    getSessionInfo
  }), [isListening, isProcessing, recognizedText, conversationHistory, error, sessionActive, sessionState, pendingOrders, startListening, stopListening, processCommand, clearRecognizedText, endSession]);

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);