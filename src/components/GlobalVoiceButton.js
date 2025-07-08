import React, {useContext} from 'react';
import {TouchableOpacity, StyleSheet, Animated, Easing} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {VoiceContext} from '../contexts/VoiceContext';

const GlobalVoiceButton = () => {
  const {isListening, startListening, stopListening} = useContext(VoiceContext);
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
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
      onPress={isListening ? stopListening : startListening}>
      <Icon name={isListening ? 'mic' : 'mic-none'} size={30} color="white" />
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000, // VoiceControlOverlay와 겹치지 않도록 zIndex 설정
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
  },
});

export default GlobalVoiceButton;
