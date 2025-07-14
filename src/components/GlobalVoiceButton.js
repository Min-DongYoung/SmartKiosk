import React, { useEffect, useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Easing
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useVoice } from '../contexts/VoiceContext';

const GlobalVoiceButton = () => {
  const {
    isListening,
    isProcessing,
    recognizedText,
    startListening,
    stopListening,
    processCommand,
    clearRecognizedText
  } = useVoice();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const processedTextRef = useRef('');

  // 펄스 애니메이션
  useEffect(() => {
    if (isListening) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
        pulseAnim.setValue(1);
      };
    }
  }, [isListening, pulseAnim]);


  // 텍스트 페이드 애니메이션
  useEffect(() => {
    if (recognizedText || isProcessing) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [recognizedText, isProcessing, fadeAnim]);

  // processCommand 호출 로직
  useEffect(() => {
    if (recognizedText &&
        !isListening &&
        !isProcessing &&
        recognizedText !== processedTextRef.current) {

      processedTextRef.current = recognizedText;
      processCommand(recognizedText);

      const timer = setTimeout(() => {
        clearRecognizedText();
        processedTextRef.current = '';
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [recognizedText, isListening, isProcessing, processCommand, clearRecognizedText]);

  const handlePress = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const getStatusMessage = useCallback(() => {
    if (isProcessing) return '처리 중...';
    if (isListening) return '듣고 있습니다...';
    if (recognizedText) return recognizedText;
    return '';
  }, [isProcessing, isListening, recognizedText]);

  const getButtonColor = useCallback(() => {
    if (isProcessing) return '#757575'; // 회색 (처리중, 입력 불가)
    if (isListening) return '#FF4444';  // 빨강 (인식중)
    return '#4CAF50';                   // 초록 (기본, 입력 가능)
  }, [isProcessing, isListening]);

  const getButtonIcon = useCallback(() => {
    if (isListening) return 'mic';      // 인식중
    return 'mic-none';                  // 기본/처리중
  }, [isListening]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: getButtonColor() },
          isListening && { transform: [{ scale: pulseAnim }] } // 펄스 애니메이션 적용
        ]}
        onPress={handlePress}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Icon
            name={getButtonIcon()}
            size={24}
            color="white"
          />
        )}
        <Text style={styles.buttonText}>{getStatusMessage() || '음성으로 주문'}</Text>
      </TouchableOpacity>

      {(recognizedText || isProcessing) && (
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.statusText}>{getStatusMessage()}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 220, // 너비 증가
    height: 40, // 높이 증가
    borderRadius: 25, // 더 둥글게
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18, // 폰트 크기 증가
    fontWeight: 'bold',
    marginLeft: 10,
  },
  textContainer: {
    position: 'absolute',
    top: 60, // 버튼 아래에 위치
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    maxWidth: '80%',
  },
  statusText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default GlobalVoiceButton;