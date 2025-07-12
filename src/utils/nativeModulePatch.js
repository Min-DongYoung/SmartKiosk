import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

// NativeEventEmitter 경고 수정을 위한 패치
export const patchNativeEventEmitter = () => {
  if (Platform.OS === 'android') {
    // Voice 모듈 패치
    if (NativeModules.Voice) {
      NativeModules.Voice.addListener = NativeModules.Voice.addListener || (() => {});
      NativeModules.Voice.removeListeners = NativeModules.Voice.removeListeners || (() => {});
    }
    
    // TextToSpeech 모듈 패치
    if (NativeModules.TextToSpeech) {
      NativeModules.TextToSpeech.addListener = NativeModules.TextToSpeech.addListener || (() => {});
      NativeModules.TextToSpeech.removeListeners = NativeModules.TextToSpeech.removeListeners || (() => {});
    }
  }
};

// 앱 시작 시 한 번만 실행
patchNativeEventEmitter();