## 음성 인식 및 Gemini 연동 핵심 구현 내용 (복구 전 백업)

이 문서는 `git reset --hard` 명령으로 코드를 이전 상태로 복구하기 전에, 현재까지 구현된 음성 인식 및 Google Gemini Pro 연동 관련 핵심 코드 내용을 정리한 것입니다. 나중에 Phase 2를 시작할 때 참고할 수 있습니다.

### 1. 라이브러리 설치

```bash
npm install @react-native-community/voice react-native-tts axios react-native-vector-icons
```

### 2. 권한 설정

*   **Android (`android/app/src/main/AndroidManifest.xml`):**
    ```xml
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    ```
    `<uses-permission android:name="android.permission.INTERNET" />` 바로 아래에 추가.

*   **iOS (`ios/SmartKiosk/Info.plist`):**
    ```xml
    <key>NSMicrophoneUsageDescription</key>
    <string>음성 인식을 위해 마이크 접근이 필요합니다.</string>
    ```
    `<key>NSLocationWhenInUseUsageDescription</key>` 바로 위에 추가.

### 3. `src/contexts/VoiceContext.js`

```javascript
// VoiceContext.js (핵심 로직)
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
import menuData from '../data/menuData';
import { processVoiceCommand as processVoiceCommandFromGemini } from '../services/geminiService';
import { getMenuPrice } from '../utils/menuHelper';

export const VoiceContext = createContext();

export const VoiceProvider = ({children, navigation, addToCart}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechResults, setSpeechResults] = useState([]);
  const silenceTimerRef = useRef(null);
  const maxListeningTimerRef = useRef(null);

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
                const selectedMenuItem = menuData.find(menu => menu.name === item.menu);
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
              const selectedMenuItem = menuData.find(menu => menu.name === menuName);
              if (selectedMenuItem) {
                Tts.speak(`${menuName}의 가격은 ${selectedMenuItem.price.toLocaleString()}원 입니다.`);
              } else {
                Tts.speak(`${menuName}을(를) 찾을 수 없습니다.`);
              }
            } else {
              Tts.speak('어떤 메뉴를 조회할지 알 수 없습니다.');
            }
            break;
          default:
            Tts.speak(`이해하지 못했습니다. ${geminiResult.response} 다시 말씀해주세요.`);
            break;
        }
      } catch (error) {
        console.error('음성 명령 처리 오류:', error);
        Tts.speak('음성 명령을 처리하는 데 문제가 발생했습니다. 다시 말씀해주세요.');
      }
    },
    [navigation, addToCart],
  );

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      await Voice.start('ko-KR');
    } catch (e) {
      console.error(e);
      Tts.speak('음성 인식을 시작할 수 없습니다.');
    }
  }, []);

  const onSpeechStart = useCallback(() => {
    console.log('음성 인식 시작');
    setIsListening(true);
    maxListeningTimerRef.current = setTimeout(() => {
      stopListening();
      Tts.speak('오랫동안 음성 입력이 없어 인식을 종료합니다.');
    }, 10000);
  }, [stopListening]);

  const onSpeechRecognized = useCallback(e => {
    console.log('onSpeechRecognized: ', e);
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
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, 2000);
    },
    [stopListening],
  );

  const onSpeechVolumeChanged = useCallback(e => {
    // console.log('onSpeechVolumeChanged: ', e);
  }, []);

  useEffect(() => {
    Tts.setDefaultLanguage('ko-KR');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
  }, []);

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
```

### 4. `src/components/GlobalVoiceButton.js`

```javascript
// GlobalVoiceButton.js
import React, { useContext } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VoiceContext } from '../contexts/VoiceContext';

const GlobalVoiceButton = () => {
  const { isListening, startListening, stopListening } = useContext(VoiceContext);
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(0);
    }
  }, [isListening, pulseAnim]);

  const pulseStyle = {
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.5],
        }),
      },
    ],
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 0],
    }),
  };

  return (
    <TouchableOpacity
      style={[styles.button, isListening && styles.listening]}
      onPress={isListening ? stopListening : startListening}
    >
      <Icon 
        name={isListening ? "mic" : "mic-none"} 
        size={30} 
        color="white" 
      />
      {isListening && <Animated.View style={[styles.pulse, pulseStyle]} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  listening: {
    backgroundColor: '#f44336',
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f44336',
    opacity: 0.3,
  }
});

export default GlobalVoiceButton;
```

### 5. `src/services/geminiService.js`

```javascript
// geminiService.js
import axios from 'axios';

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // 임의의 값으로 설정
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const processVoiceCommand = async (voiceInput) => {
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
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    return JSON.parse(generatedText);
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw error;
  }
};
```

### 6. `src/utils/menuHelper.js`

```javascript
// menuHelper.js
import menuData from '../data/menuData';

export const getMenuPrice = (menuName, size) => {
  const menuItem = menuData.find(item => item.name === menuName);

  if (!menuItem) {
    return 0; // 메뉴를 찾을 수 없으면 0 반환
  }

  let price = menuItem.price;

  // 사이즈에 따른 가격 변동 (MenuDetailScreen의 로직과 동일하게)
  if (size === 'small') {
    price -= 500;
  } else if (size === 'large') {
    price += 500;
  }

  return price;
};
```

### 7. `App.js`

```javascript
// App.js
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider, CartContext } from './src/context/CartContext';
import { VoiceProvider } from './src/contexts/VoiceContext';
import GlobalVoiceButton from './src/components/GlobalVoiceButton';

// VoiceProvider에 navigation과 CartContext의 addToCart를 전달하기 위한 래퍼 컴포넌트
const AppContent = () => {
  const navigation = useNavigation();
  const { addToCart } = React.useContext(CartContext);

  return (
    <VoiceProvider navigation={navigation} addToCart={addToCart}>
      <AppNavigator />
      <GlobalVoiceButton />
    </VoiceProvider>
  );
};

const App = () => {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
};

export default App;
```
