import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function ColorTap({ mode, onGameEnd }) {
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'ready', 'result'
  const [resultMsg, setResultMsg] = useState('WAIT FOR GREEN');
  const timeoutRef = useRef(null);
  const botTimeoutRef = useRef(null);

  const bgAnim = useRef(new Animated.Value(0)).current;

  // 0: Red, 1: Green, 2: Dark Blue
  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['#FF2A54', '#00F0FF', '#0B0F19'] 
  });

  const animateBg = (toVal) => {
    Animated.timing(bgAnim, {
      toValue: toVal,
      duration: 300,
      useNativeDriver: false // cannot use native driver for color
    }).start();
  };

  const startRound = () => {
    setGameState('waiting');
    setResultMsg('WAIT FOR NEON BLUE');
    animateBg(0);
    
    const randomDelay = Math.random() * 3000 + 2000; // 2 to 5 seconds
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      setResultMsg('TAP NOW!');
      animateBg(1);

      if (mode === 'bot') {
        const botReactionTime = Math.random() * 300 + 250; // 250ms to 550ms
        botTimeoutRef.current = setTimeout(() => {
          handleTap('p2');
        }, botReactionTime);
      }
    }, randomDelay);
  };

  useEffect(() => {
    startRound();
    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(botTimeoutRef.current);
    };
  }, []);

  const checkWinner = (newScores) => {
    if (newScores.p1 >= 3) {
      setTimeout(() => onGameEnd(1), 1500);
      return true;
    } else if (newScores.p2 >= 3) {
      setTimeout(() => onGameEnd(2), 1500);
      return true;
    }
    return false;
  };

  const handleTap = (player) => {
    if (gameState === 'result') return; // Ignore taps during result

    clearTimeout(timeoutRef.current);
    clearTimeout(botTimeoutRef.current);
    animateBg(2);

    let newScores = { ...scores };
    const otherPlayer = player === 'p1' ? 'p2' : 'p1';

    if (gameState === 'waiting') {
      // False start
      setResultMsg(`P${player === 'p1' ? '1' : '2'} FALSE START`);
      newScores[otherPlayer] += 1;
    } else if (gameState === 'ready') {
      // Correct tap
      setResultMsg(`P${player === 'p1' ? '1' : '2'} POINT`);
      newScores[player] += 1;
    }

    setScores(newScores);
    setGameState('result');

    if (!checkWinner(newScores)) {
      setTimeout(startRound, 2000); // Start next round after 2 seconds
    } else {
      setResultMsg(`P${newScores.p1 >= 3 ? '1' : '2'} WINS THE GAME!`);
    }
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Player 2 Area (Top) */}
      <View 
        style={styles.half} 
        onTouchStart={() => {
           if (mode === 'friend') handleTap('p2');
        }}
      >
        <Text style={[styles.scoreText, { transform: [{ rotate: '180deg' }] }]}>P2 SCORE: {scores.p2}</Text>
      </View>

      {/* Center Message */}
      <View style={styles.centerContainer} pointerEvents="none">
        <View style={styles.glassPill}>
          <Text style={styles.centerText}>{resultMsg}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Player 1 Area (Bottom) */}
      <View 
        style={styles.half} 
        onTouchStart={() => handleTap('p1')}
      >
        <Text style={styles.scoreText}>P1 SCORE: {scores.p1}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  half: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  divider: { height: 6, width: '100%', backgroundColor: 'rgba(255,255,255,0.8)', shadowColor: '#fff', shadowOpacity: 1, shadowRadius: 10 },
  scoreText: { color: 'rgba(255,255,255,0.7)', fontSize: 40, fontWeight: '900', letterSpacing: 2 },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  glassPill: {
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  centerText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 3, textAlign: 'center' }
});
