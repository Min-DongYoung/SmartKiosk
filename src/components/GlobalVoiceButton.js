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
    sessionActive,
    sessionState,
    pendingOrders,
    startListening, 
    stopListening,
    processCommand,
    clearRecognizedText,
    getSessionInfo,
    quickCommand
  } = useVoice();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pendingBadgeAnim = useRef(new Animated.Value(0)).current;
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

  // 대기 주문 배지 애니메이션
  useEffect(() => {
    if (pendingOrders.length > 0) {
      Animated.spring(pendingBadgeAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(pendingBadgeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [pendingOrders, pendingBadgeAnim]);

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
    
    // 세션 상태별 메시지
    switch (sessionState) {
      case 'waiting_confirm':
        return '확인을 기다리고 있습니다';
      case 'continuous':
        return '추가 주문을 받고 있습니다';
      default:
        return '';
    }
  }, [isProcessing, isListening, recognizedText, sessionState]);

  const getButtonColor = useCallback(() => {
    if (isProcessing) return '#FF9800'; // 주황
    if (isListening) return '#f44336'; // 빨강
    if (sessionState === 'waiting_confirm') return '#FFC107'; // 노랑
    if (sessionState === 'continuous') return '#4CAF50'; // 초록
    if (sessionActive) return '#2196F3'; // 파랑
    return '#757575'; // 회색
  }, [isProcessing, isListening, sessionActive, sessionState]);

  const getButtonIcon = useCallback(() => {
    if (sessionState === 'waiting_confirm') return 'help-outline';
    if (sessionState === 'continuous') return 'add-circle-outline';
    if (isListening) return 'mic';
    if (sessionActive) return 'mic-external-on';
    return 'mic-none';
  }, [isListening, sessionActive, sessionState]);

  // 빠른 액션 버튼들 렌더링
  const renderQuickActions = () => {
    if (!sessionActive || sessionState !== 'continuous') return null;
    
    return (
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={[styles.quickAction, styles.confirmAction]}
          onPress={() => quickCommand('네, 맞습니다')}
        >
          <Icon name="check" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickAction, styles.cancelAction]}
          onPress={() => quickCommand('취소해주세요')}
        >
          <Icon name="close" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickAction, styles.completeAction]}
          onPress={() => quickCommand('주문 완료할게요')}
        >
          <Icon name="shopping-cart" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
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
              size={30} 
              color="white" 
            />
          )}
        </TouchableOpacity>
        
        {pendingOrders && pendingOrders.length > 0 && (
          <Animated.View 
            style={[
              styles.badge,
              {
                transform: [{ scale: pendingBadgeAnim }],
              }
            ]}
          >
            <Text style={styles.badgeText}>{pendingOrders.length}</Text>
          </Animated.View>
        )}
        
        {/* 세션 상태 인디케이터 */}
        {sessionActive && !isListening && !isProcessing && (
          <View style={[
            styles.sessionIndicator,
            { backgroundColor: getSessionStateColor() }
          ]} />
        )}
      </Animated.View>

      {/* 빠른 액션 버튼들 */}
      {renderQuickActions()}

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
          
          {pendingOrders && pendingOrders.length > 0 && (
            <Text style={styles.pendingText}>
              대기중: {pendingOrders.map(o => o.summary).join(', ')}
            </Text>
          )}
        </Animated.View>
      )}
    </>
  );
  
  function getSessionStateColor() {
    switch (sessionState) {
      case 'waiting_confirm': return '#FFC107';
      case 'continuous': return '#4CAF50';
      default: return '#2196F3';
    }
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 1000,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    bottom: 100,
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