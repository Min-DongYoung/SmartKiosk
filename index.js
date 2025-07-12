/**
 * @format
 */

import { AppRegistry, LogBox, NativeModules } from 'react-native';
import App from './App.js';
import { name as appName } from './app.json';

// NativeEventEmitter 경고 해결
if (NativeModules.Voice) {
  NativeModules.Voice.addListener = NativeModules.Voice.addListener || (() => {});
  NativeModules.Voice.removeListeners = NativeModules.Voice.removeListeners || (() => {});
}

if (NativeModules.TextToSpeech) {
  NativeModules.TextToSpeech.addListener = NativeModules.TextToSpeech.addListener || (() => {});
  NativeModules.TextToSpeech.removeListeners = NativeModules.TextToSpeech.removeListeners || (() => {});
}

// 개발 환경에서만 특정 경고 무시
if (__DEV__) {
  LogBox.ignoreLogs([
    'new NativeEventEmitter',
    'removeListeners',
    'Non-serializable values were found in the navigation state',
  ]);
  
  // Text 렌더링 에러 디버깅
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string') {
      if (args[0].includes('Text strings must be rendered within a <Text> component')) {
        console.log('=== Text 렌더링 에러 상세 정보 ===');
        console.log('에러 메시지:', args[0]);
        if (args[0].includes('VoiceProvider')) {
          console.log('VoiceProvider에서 문제 발생 - children 확인 필요');
        }
        console.log('================================');
      }
    }
    originalConsoleError.apply(console, args);
  };
}

AppRegistry.registerComponent(appName, () => App);