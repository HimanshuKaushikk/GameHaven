import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import SoundManager from '../state/SoundManager';

export default function CountdownOverlay({ onComplete }) {
  const [count, setCount] = useState(3);
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (count > 0) {
      SoundManager.play('timer');
      scale.setValue(0.5);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 4,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setCount(count - 1));
      }, 700);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      SoundManager.play('win'); // Optional: a different sound for GO! 
      scale.setValue(0.5);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setCount(-1);
          onComplete();
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [count, onComplete, scale, opacity]);

  if (count < 0) return null;

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, { transform: [{ scale }], opacity }]}>
        {count > 0 ? count : 'GO!'}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  text: {
    fontSize: 100,
    fontWeight: '900',
    color: '#F8FAFC',
    textShadowColor: 'rgba(139, 92, 246, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  }
});
