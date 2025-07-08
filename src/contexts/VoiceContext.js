/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';
import menuData from '../data/menuData'; // 메뉴 데이터 임포트
import {processVoiceCommand as processVoiceCommandFromGemini} from '../services/geminiService'; // Gemini 서비스 임포트
import {getMenuPrice} from '../utils/menuHelper'; // 메뉴 헬퍼 임포트

export const VoiceContext = createContext();

export const VoiceProvider = ({children, navigation, addToCart}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechResults, setSpeechResults] = useState([]);
  const silenceTimerRef = useRef(null);
  const maxListeningTimerRef = useRef(null);

  // processVoiceCommand는 나중에 LLM과 연동될 예정
  const processVoiceCommand = useCallback(
    async command => {
      console.log('처리할 음성 명령:', command);
      Tts.speak('명령을 처리 중입니다.');

      try {
        const geminiResult = await processVoiceCommandFromGemini(command);
        console.log('Gemini 처리 결과:', geminiResult);

        Tts.speak(geminiResult.response);

        switch (geminiResult.action) {
          case '주문':
            if (geminiResult.items && geminiResult.items.length > 0) {
              geminiResult.items.forEach(item => {
                const selectedMenuItem = menuData.find(
                  menu => menu.name === item.menu,
                );
                if (selectedMenuItem) {
                  const itemPrice = getMenuPrice(item.menu, item.size);
                  const cartItem = {
                    id: selectedMenuItem.id,
                    name: selectedMenuItem.name,
                    price: selectedMenuItem.price, // 기본 메뉴 가격
                    quantity: item.quantity || 1,
                    options: {
                      size: item.size || 'medium',
                      temperature: item.temperature || 'hot',
                    },
                    totalPrice: itemPrice * (item.quantity || 1),
                  };
                  addToCart(cartItem);
                } else {
                  Tts.speak(`${item.menu}을(를) 찾을 수 없습니다.`);
                }
              });
            } else {
              Tts.speak('주문할 메뉴를 찾을 수 없습니다.');
            }
            break;
          case '수정':
            Tts.speak('수정 기능은 아직 지원하지 않습니다.');
            break;
          case '취소':
            Tts.speak('취소 기능은 아직 지원하지 않습니다.');
            break;
          case '조회':
            if (geminiResult.items && geminiResult.items.length > 0) {
              const menuName = geminiResult.items[0].menu;
              const selectedMenuItem = menuData.find(
                menu => menu.name === menuName,
              );
              if (selectedMenuItem) {
                Tts.speak(
                  `${menuName}의 가격은 ${selectedMenuItem.price.toLocaleString()}원 입니다.`,
                );
              } else {
                Tts.speak(`${menuName}을(를) 찾을 수 없습니다.`);
              }
            } else {
              Tts.speak('어떤 메뉴를 조회할지 알 수 없습니다.');
            }
            break;
          default:
            Tts.speak('이해하지 못했습니다. 다시 말씀해주세요.');
            break;
        }
      } catch (error) {
        console.error('음성 명령 처리 오류:', error);
        Tts.speak(
          '음성 명령을 처리하는 데 문제가 발생했습니다. 다시 말씀해주세요.',
        );
      }
    },
    [navigation, addToCart],
  );

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
      // onSpeechEnd에서 isListening을 false로 설정
    } catch (e) {
      console.error(e);
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      await Voice.start('ko-KR');
      // onSpeechStart에서 isListening을 true로 설정
    } catch (e) {
      console.error(e);
      Tts.speak('음성 인식을 시작할 수 없습니다.');
    }
  }, []);

  const onSpeechStart = useCallback(() => {
    console.log('음성 인식 시작');
    setIsListening(true);
    // 최대 대기 시간 타이머 설정 (10초)
    maxListeningTimerRef.current = setTimeout(() => {
      stopListening();
      Tts.speak('오랫동안 음성 입력이 없어 인식을 종료합니다.');
    }, 10000);
  }, [stopListening]);

  const onSpeechRecognized = useCallback(e => {
    console.log('onSpeechRecognized: ', e);
    // setRecognized('true'); // VoiceControlOverlay에서 사용되던 상태
  }, []);

  const onSpeechEnd = useCallback(() => {
    console.log('음성 인식 종료');
    setIsListening(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxListeningTimerRef.current) {
      clearTimeout(maxListeningTimerRef.current);
      maxListeningTimerRef.current = null;
    }
  }, []);

  const onSpeechError = useCallback(
    e => {
      console.error('음성 인식 에러: ', e);
      setIsListening(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (maxListeningTimerRef.current) {
        clearTimeout(maxListeningTimerRef.current);
        maxListeningTimerRef.current = null;
      }
      Tts.speak('음성 인식 중 오류가 발생했습니다.');
    },
    [stopListening],
  );

  const onSpeechResults = useCallback(
    e => {
      const results = e.value;
      setSpeechResults(results);
      processVoiceCommand(results[0]);
    },
    [processVoiceCommand],
  );

  const onSpeechPartialResults = useCallback(
    e => {
      // 중간 결과 수신 시 사일런스 타이머 리셋
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      // 2초 동안 추가 입력이 없으면 자동 종료
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, 2000);
    },
    [stopListening],
  );

  const onSpeechVolumeChanged = useCallback(e => {
    // console.log('onSpeechVolumeChanged: ', e); // VoiceControlOverlay에서 사용되던 상태
    // setPitch(e.value); // VoiceControlOverlay에서 사용되던 상태
  }, []);

  // TTS 초기화
  useEffect(() => {
    Tts.setDefaultLanguage('ko-KR');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
  }, []);

  // Voice 이벤트 리스너 등록
  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [
    onSpeechStart,
    onSpeechRecognized,
    onSpeechEnd,
    onSpeechError,
    onSpeechResults,
    onSpeechPartialResults,
    onSpeechVolumeChanged,
  ]);

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        speechResults,
        startListening,
        stopListening,
        processVoiceCommand,
      }}>
      {children}
    </VoiceContext.Provider>
  );
};
