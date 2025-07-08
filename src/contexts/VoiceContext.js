import React, { createContext, useState, useEffect, useContext } from 'react';
import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';
import { useNavigation } from '@react-navigation/native';
import { findMenuItem } from '../data/menuData';

export const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [recognizedTextTimer, setRecognizedTextTimer] = useState(null); // 추가
  const navigation = useNavigation();

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
    processCommand(text);

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

  const processCommand = (command) => {
    const lowerCommand = command.toLowerCase();

    // 메뉴 주문 처리
    const menuItem = findMenuItem(lowerCommand);
    if (menuItem) {
      Tts.speak(`${menuItem.name} 화면으로 이동합니다`);
      navigation.navigate('MenuDetail', { item: menuItem });
      return;
    }

    // 네비게이션 명령어
    if (lowerCommand.includes('장바구니')) {
      Tts.speak('장바구니로 이동합니다');
      navigation.navigate('Cart');
    } else if (lowerCommand.includes('홈')) {
      Tts.speak('홈 화면으로 이동합니다');
      navigation.navigate('Home');
    } else if (lowerCommand.includes('메뉴')) {
      Tts.speak('메뉴 목록으로 이동합니다');
      navigation.navigate('MenuList');
    } else {
      Tts.speak('명령을 이해하지 못했습니다. 다시 말씀해주세요.');
    }
  };

  return (
    <VoiceContext.Provider value={{
      isListening,
      recognizedText,
      error,
      startListening,
      stopListening
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);