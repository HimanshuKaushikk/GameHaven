import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

export default function MathClash({ mode, onGameEnd }) {
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [equation, setEquation] = useState({ str: '', isTrue: true });
  const [gameOver, setGameOver] = useState(false);
  const botTimeoutRef = useRef(null);
  const timeBarAnim = useRef(new Animated.Value(1)).current;
  const timerInstance = useRef(null);

  const generateEquation = () => {
    const isActuallyTrue = Math.random() > 0.5;
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * 2)];
    
    let realAns = op === '+' ? num1 + num2 : num1 - num2;
    let dispAns = realAns;

    if (!isActuallyTrue) {
      const offset = Math.floor(Math.random() * 5) + 1;
      dispAns += Math.random() > 0.5 ? offset : -offset;
    }

    setEquation({ str: `${num1} ${op} ${num2} = ${dispAns}`, isTrue: isActuallyTrue });

    // Start Timer
    timeBarAnim.setValue(1);
    timerInstance.current = Animated.timing(timeBarAnim, {
      toValue: 0,
      duration: 5000, // 5 seconds per question
      easing: Easing.linear,
      useNativeDriver: false
    });
    
    timerInstance.current.start(({ finished }) => {
      if (finished) {
        // Time ran out -> both lose point? No, just skip to next
        generateEquation();
      }
    });
  };

  useEffect(() => {
    generateEquation();
    return () => {
      clearTimeout(botTimeoutRef.current);
      if (timerInstance.current) timerInstance.current.stop();
    };
  }, []);

  const handleBotMode = () => {
    if (gameOver) return;
    clearTimeout(botTimeoutRef.current);
    
    const botReaction = Math.random() * 1500 + 1500; // 1.5-3s
    botTimeoutRef.current = setTimeout(() => {
      // Bot has 70% chance to be right based on time pressure
      const isRight = Math.random() > 0.3;
      handleAnswer('p2', isRight ? equation.isTrue : !equation.isTrue);
    }, botReaction);
  };

  useEffect(() => {
    if (mode === 'bot' && equation.str !== '') {
      handleBotMode();
    }
  }, [equation, mode]);

  const checkWinner = (newScores) => {
    if (newScores.p1 >= 5) {
      setGameOver(true);
      if (timerInstance.current) timerInstance.current.stop();
      setTimeout(() => onGameEnd(1), 1500);
      return true;
    } else if (newScores.p2 >= 5) {
      setGameOver(true);
      if (timerInstance.current) timerInstance.current.stop();
      setTimeout(() => onGameEnd(2), 1500);
      return true;
    }
    return false;
  };

  const handleAnswer = (player, guess) => {
    if (gameOver) return;
    if (timerInstance.current) timerInstance.current.stop();

    let newScores = { ...scores };
    const otherPlayer = player === 'p1' ? 'p2' : 'p1';

    if (guess === equation.isTrue) {
      newScores[player] += 1;
    } else {
      newScores[otherPlayer] += 1;
    }

    setScores(newScores);
    if (!checkWinner(newScores)) {
      generateEquation();
    }
  };

  const barWidth = timeBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const barColor = timeBarAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#FF2A54', '#FFE66D', '#00F0FF']
  });

  return (
    <View style={styles.container}>
      {/* Player 2 Area */}
      <View style={[styles.playerArea, { transform: [{ rotate: '180deg' }] }]}>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreText, { color: '#00F0FF' }]}>P2 SCORE: {scores.p2}</Text>
        </View>
        <View style={styles.controls}>
          <View style={[styles.btn, styles.trueBtn, (mode==='bot' || gameOver) && { opacity: 0.5 }]} onTouchStart={() => {
            if (mode === 'friend' && !gameOver) handleAnswer('p2', true);
          }}>
            <Text style={styles.btnText}>TRUE</Text>
          </View>
          <View style={[styles.btn, styles.falseBtn, (mode==='bot' || gameOver) && { opacity: 0.5 }]} onTouchStart={() => {
            if (mode === 'friend' && !gameOver) handleAnswer('p2', false);
          }}>
            <Text style={styles.btnText}>FALSE</Text>
          </View>
        </View>
      </View>

      {/* Center Equation Area */}
      <View style={styles.centerArea}>
        <Animated.View style={[styles.timerBar, { width: barWidth, backgroundColor: barColor }]} />
        <View style={styles.equationBox}>
          <Text style={styles.equationText}>{gameOver ? 'MATCH OVER' : equation.str}</Text>
        </View>
      </View>

      {/* Player 1 Area */}
      <View style={styles.playerArea}>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreText, { color: '#FF2A54' }]}>P1 SCORE: {scores.p1}</Text>
        </View>
        <View style={styles.controls}>
          <View style={[styles.btn, styles.trueBtn, gameOver && { opacity: 0.5 }]} onTouchStart={() => {
            if (!gameOver) handleAnswer('p1', true);
          }}>
            <Text style={styles.btnText}>TRUE</Text>
          </View>
          <View style={[styles.btn, styles.falseBtn, gameOver && { opacity: 0.5 }]} onTouchStart={() => {
            if (!gameOver) handleAnswer('p1', false);
          }}>
            <Text style={styles.btnText}>FALSE</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', backgroundColor: '#0B0F19' },
  playerArea: { flex: 1, justifyContent: 'center', padding: 30 },
  scoreRow: { alignItems: 'center', marginBottom: 40 },
  scoreText: { fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  controls: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { 
    paddingVertical: 20, 
    borderRadius: 20, 
    width: '45%', 
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  trueBtn: { backgroundColor: 'rgba(0, 240, 255, 0.1)', borderColor: '#00F0FF', shadowColor: '#00F0FF' },
  falseBtn: { backgroundColor: 'rgba(255, 42, 84, 0.1)', borderColor: '#FF2A54', shadowColor: '#FF2A54' },
  btnText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  centerArea: { 
    height: 140, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#0F172A',
    borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#1E293B',
    position: 'relative'
  },
  timerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  equationBox: {
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#fff',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  equationText: { color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: 4, textShadowColor: '#FFE66D', textShadowRadius: 15 }
});
