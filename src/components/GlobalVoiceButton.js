import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useVoice } from '../contexts/VoiceContext';

const GlobalVoiceButton = () => {
  const { isListening, recognizedText, startListening, stopListening } = useVoice();
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
          style={[styles.button, isListening && styles.listeningButton]}
          onPress={isListening ? stopListening : startListening}
          activeOpacity={0.8}
        >
          <Icon 
            name={isListening ? "mic" : "mic-none"} 
            size={30} 
            color="white" 
          />
        </TouchableOpacity>
      </Animated.View>

      {/* 인식된 텍스트 표시 */}
      {recognizedText !== '' && (
        <View style={styles.textContainer}>
          <Text style={styles.recognizedText}>{recognizedText}</Text>
        </View>
      )}
    </>
  );
};

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
  textContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
  },
  recognizedText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GlobalVoiceButton;