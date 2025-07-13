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
            toValue: 1.3,
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
    if (isListening) return '#f44336';  // 빨강 (인식중)
    return '#2196F3';                   // 파랑 (기본, 입력 가능)
  }, [isProcessing, isListening]);

  const getButtonIcon = useCallback(() => {
    if (isListening) return 'mic';      // 인식중
    return 'mic-none';                  // 기본/처리중
  }, [isListening]);

  // 빠른 액션 버튼들 제거 - 단순화

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: getButtonColor() }
          ]}
          onPress={handlePress}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <Icon 
              name={getButtonIcon()} 
              size={38} 
              color="white" 
            />
          )}
        </TouchableOpacity>
        
        {/* 복잡한 상태 인디케이터들 제거 */}
      </Animated.View>

      {/* 상태 메시지 */}
      {getStatusMessage() !== '' && (
        <Animated.View 
          style={[
            styles.textContainer,
            { opacity: fadeAnim }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.statusText}>
            {getStatusMessage()}
          </Text>
        </Animated.View>
      )}
    </>
  );
  
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionIndicator: {
    position: 'absolute',
    bottom: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    alignSelf: 'center',
  },
  textContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 15,
    borderRadius: 10,
    maxHeight: 120,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  pendingText: {
    color: '#FFC107',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  quickActionsContainer: {
    position: 'absolute',
    bottom: 30,
    right: 100,
    flexDirection: 'row',
    gap: 10,
  },
  quickAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  confirmAction: {
    backgroundColor: '#4CAF50',
  },
  cancelAction: {
    backgroundColor: '#F44336',
  },
  completeAction: {
    backgroundColor: '#2196F3',
  },
});

export default GlobalVoiceButton;