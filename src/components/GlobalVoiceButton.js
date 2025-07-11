import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native'; // 추가
import { useVoice } from '../contexts/VoiceContext';

const GlobalVoiceButton = () => {
  const { 
    isListening, 
    isProcessing, 
    recognizedText, 
    startListening, 
    stopListening,
    processCommand, // 추가
    clearRecognizedText // 추가
  } = useVoice();
  
  const navigation = useNavigation(); // 추가
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      // 펄스 애니메이션
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  // recognizedText 변경 감지하여 processCommand 호출
  useEffect(() => {
    if (recognizedText && !isListening && !isProcessing) {
      // 빈 문자열이 아니고, 듣기/처리 중이 아닐 때만 실행
      processCommand(recognizedText, navigation);
      
      // 처리 후 3초 뒤에 텍스트 초기화
      setTimeout(() => {
        clearRecognizedText();
      }, 3000);
    }
  }, [recognizedText, navigation, isListening, isProcessing, processCommand, clearRecognizedText]); // 의존성 배열 추가

  const getStatusMessage = () => {
    if (isProcessing) return '처리 중...';
    if (isListening) return '듣고 있습니다...';
    if (recognizedText) return recognizedText;
    return '';
  };

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
            isListening && styles.listeningButton,
            isProcessing && styles.processingButton // 추가
          ]}
          onPress={isListening ? stopListening : startListening}
          disabled={isProcessing} // 추가
          activeOpacity={0.8}
        >
          {isProcessing ? ( // 추가
            <ActivityIndicator color="white" size="large" /> // 추가
          ) : ( // 추가
            <Icon 
              name={isListening ? "mic" : "mic-none"} 
              size={30} 
              color="white" 
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* 인식된 텍스트 표시 */}
      {getStatusMessage() !== '' && (
        <View style={styles.textContainer}>
          <Text style={styles.statusText}> {/* recognizedText 대신 statusText 사용 */}
            {getStatusMessage()}
          </Text>
        </View>
      )}
    </>
  );
};

// 스타일 추가
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  button: {
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
  },
  listeningButton: {
    backgroundColor: '#f44336',
  },
  processingButton: { // 추가
    backgroundColor: '#FF9800',
  },
  textContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
  },
  statusText: { // recognizedText 대신 statusText 사용
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default GlobalVoiceButton;