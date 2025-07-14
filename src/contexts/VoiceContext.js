import React, { createContext, useState, useEffect, useRef, useCallback, useContext } from 'react';
import Tts from 'react-native-tts';
import Voice from '@react-native-community/voice';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

import { voiceService } from '../services/voiceService';
import { useMenu } from './MenuContext';
import { CartContext } from './CartContext';

export const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionState, setSessionState] = useState('idle'); // idle, continuous, waiting_confirm, reviewing_order
  const [pendingOrders, setPendingOrders] = useState([]);

  const navigation = useNavigation();
  const sessionTimerRef = useRef(null);

  const { addToCart, clearCart, removeItem, cartItems, createOrder } = useContext(CartContext);
  const { findMenuItem } = useMenu();

  // TTS 설정
  useEffect(() => {
    Tts.setDefaultLanguage('ko-KR');
    Tts.setDefaultRate(0.5);
    Tts.setDucking(true);

    Tts.addEventListener('tts-start', event => console.log("start", event));
    Tts.addEventListener('tts-finish', event => console.log("finish", event));
    Tts.addEventListener('tts-cancel', event => console.log("cancel", event));

    return () => {
      Tts.removeEventListener('tts-start');
      Tts.removeEventListener('tts-finish');
      Tts.removeEventListener('tts-cancel');
    };
  }, []);

  // 음성 인식 설정
  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = useCallback(e => {
    console.log('onSpeechStart: ', e);
    setIsListening(true);
    setRecognizedText('');
    setIsProcessing(false);
  }, []);

  const onSpeechEnd = useCallback(e => {
    console.log('onSpeechEnd: ', e);
    setIsListening(false);
  }, []);

  const onSpeechResults = useCallback(e => {
    console.log('onSpeechResults: ', e);
    if (e.value && e.value.length > 0) {
      const text = e.value[0];
      setRecognizedText(text);
      processCommand(text); // 음성 인식 완료 후 명령 처리
    }
  }, [processCommand]);

  const onSpeechError = useCallback(e => {
    console.log('onSpeechError: ', e);
    setIsListening(false);
    setIsProcessing(false);
    if (e.error && e.error.message.includes('No match')) {
      // 사용자가 아무 말도 하지 않았을 때
      speak('다시 말씀해 주시겠어요?');
    } else {
      speak('음성 인식에 오류가 발생했습니다.');
    }
  }, []);

  const speak = useCallback(async text => {
    Tts.stop();
    await Tts.speak(text);
  }, []);

  const startListening = useCallback(async () => {
    try {
      setRecognizedText('');
      setIsProcessing(false);
      await Voice.start('ko-KR');
      startSession();
    } catch (e) {
      console.error(e);
    }
  }, [startSession]);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const clearRecognizedText = useCallback(() => {
    setRecognizedText('');
  }, []);

  const startSession = useCallback(() => {
    if (!sessionActive) {
      setSessionActive(true);
      setSessionState('continuous');
      setConversationHistory([]);
      setPendingOrders([]);
      speak('무엇을 도와드릴까요?');
    }
    // 세션 타이머 재설정
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
    }
    sessionTimerRef.current = setTimeout(() => {
      endSession();
    }, 60000); // 1분 동안 활동 없으면 세션 종료
  }, [sessionActive, endSession, speak]);

  const endSession = useCallback(async () => {
    console.log('세션 종료');
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    setSessionActive(false);
    setSessionState('idle');
    setIsListening(false);
    setIsProcessing(false);
    setRecognizedText('');
    setConversationHistory([]);
    setPendingOrders([]);
    
    // 음성 서비스 세션 초기화
    await voiceService.clearSession();
    
    if (cartItems.length > 0) {
      speak('주문이 완료되었습니다. 이용해주셔서 감사합니다.');
    } else {
      speak('다음에 또 이용해주세요.');
    }
  }, [cartItems, speak]);

  const navigate = useCallback((screenName, params) => {
    navigation.navigate(screenName, params);
  }, [navigation]);

  const showRecommendations = useCallback(() => {
    navigation.navigate('RecommendationModal');
  }, [navigation]);

  const processCommand = useCallback(async (command) => {
    if (!command) return;

    setIsProcessing(true);
    startSession();

    try {
      // 서버에 음성 처리 요청
      const contextInfo = {
        cart: { 
          items: cartItems, 
          totalPrice: cartItems.reduce((sum, item) => sum + item.totalPrice, 0) 
        },
        sessionState,
        pendingOrders,
      };

      const response = await voiceService.processVoiceCommand({
        voiceInput: command,
        conversationHistory,
        contextInfo
      });

      if (response.success) {
        const result = response.data;
        
        setConversationHistory(prev => [
          ...prev, 
          { role: 'user', content: command },
          { role: 'assistant', content: result.response }
        ]);
        
        speak(result.response);
        handleServerResponse(result);
      } else {
        throw new Error(response.error || '서버 응답 오류');
      }
    } catch (error) {
      console.error('음성 처리 오류:', error);
      speak('죄송합니다. 음성 명령을 처리할 수 없습니다.');
    } finally {
      setIsProcessing(false);
    }
  }, [cartItems, sessionState, pendingOrders, conversationHistory, startSession, speak, handleServerResponse]);

  const handleServerResponse = useCallback(async (result) => {
    if (result.items && result.items.length > 1) {
      const [firstItem, ...remainingItems] = result.items;
      result.items = [firstItem];
      setPendingOrders(remainingItems.map(item => ({
        ...item,
        summary: `${item.name} ${item.quantity}개`
      })));
    }

    switch (result.action) {
      case 'order':
        if (result.items && result.items.length > 0) {
          const firstItem = result.items[0];
          const menuItem = findMenuItem(firstItem.name);
          
          if (!menuItem) {
            console.warn(`메뉴를 찾을 수 없음: ${firstItem.name}`);
            speak('죄송합니다. 해당 메뉴를 찾을 수 없습니다.');
            return;
          }
          
          navigate('MenuDetail', {
            item: menuItem,
            fromVoice: true,
            fromCart: false,
            fromMenuList: false,
            existingOptions: {
              size: firstItem.size || menuItem.sizeOptions?.[0] || 'medium', // sizeOptions 사용
              temperature: firstItem.temperature || menuItem.temperatureOptions?.[0] || 'hot', // temperatureOptions 사용
            },
            existingQuantity: firstItem.quantity || 1
          });
          setSessionState('reviewing_order');
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
        try {
          // 음성 세션 ID 가져오기
          const sessionId = await voiceService.getCurrentSessionId();
          
          // 주문 생성
          const order = await createOrder('card', {}, true, sessionId);
          
          speak(`주문이 완료되었습니다. 주문번호는 ${order.orderNumber}입니다.`);
          endSession();
          navigate('Home');
        } catch (error) {
          speak('주문 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
        }
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
  }, [cartItems, pendingOrders, sessionState, addToCart, removeItem, clearCart, createOrder, findMenuItem, endSession, startListening, navigate, showRecommendations, speak]);

  const value = {
    isListening,
    recognizedText,
    isProcessing,
    startListening,
    stopListening,
    clearRecognizedText,
    processCommand,
    speak,
    sessionActive,
    sessionState,
    endSession,
    conversationHistory,
    pendingOrders,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};