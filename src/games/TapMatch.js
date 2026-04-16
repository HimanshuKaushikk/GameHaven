import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import SoundManager from '../state/SoundManager';

const { width, height } = Dimensions.get('window');

// High-Adrenaline Tap Match
export default function TapMatch({ mode, onGameEnd }) {
  const [target, setTarget] = useState({ x: width/2 - 45, y: height/2 - 45, size: 90 });
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [activePlayer, setActivePlayer] = useState(null); // Last one to score

  const scaleAnim = useRef(new Animated.Value(0)).current;

  const moveTarget = () => {
    // Make target progressively smaller as time goes down
    const newSize = Math.max(50, 90 - (30 - timeLeft));
    const newX = Math.random() * (width - newSize - 40) + 20;
    const newY = Math.random() * (height - newSize - 200) + 100; 
    
    setTarget({ x: newX, y: newY, size: newSize });
    
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    moveTarget();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      setTimeout(() => {
        let winner = 0;
        if (scores.p1 > scores.p2) winner = 1;
        else if (scores.p2 > scores.p1) winner = 2;
        onGameEnd(winner);
      }, 1500);
    }
  }, [timeLeft, gameOver, scores]);

  // Bot Logic: Gets faster as time decreases
  useEffect(() => {
    if (mode === 'bot' && !gameOver) {
      const baseDelay = 600;
      const speedUp = (30 - timeLeft) * 10;
      const currentDelay = Math.max(300, baseDelay - speedUp);
      
      const botTimer = setTimeout(() => {
        // Random chance, but highly accurate 
        if (Math.random() > 0.15) {
          handleTap('p2');
        }
      }, currentDelay + Math.random() * 200);
      return () => clearTimeout(botTimer);
    }
  }, [mode, gameOver, target]);

  const handleTap = (player) => {
    if (gameOver) return;
    SoundManager.play('tap');
    setScores(s => ({ ...s, [player]: s[player] + 1 }));
    setActivePlayer(player);
    moveTarget();
  };

  // Penalty for missing
  const handleMiss = (e) => {
    if (gameOver) return;
    SoundManager.play('lose');
    const y = e.nativeEvent.pageY;
    let penalizedPlayer = y > height / 2 ? 'p1' : 'p2';
    if (mode === 'bot' && penalizedPlayer === 'p2') return; // Bot doesn't ghost tap
    setScores(s => ({ ...s, [penalizedPlayer]: Math.max(0, s[penalizedPlayer] - 1) }));
  };

  const p1Color = '#FF2A54';
  const p2Color = '#00F0FF';

  return (
    <View style={styles.container} onTouchStart={handleMiss}>
      {/* Split background subtle effect */}
      <View style={[styles.bgHalf, { top: 0, backgroundColor: activePlayer === 'p2' ? 'rgba(0, 240, 255, 0.05)' : 'transparent' }]} />
      <View style={[styles.bgHalf, { bottom: 0, backgroundColor: activePlayer === 'p1' ? 'rgba(255, 42, 84, 0.05)' : 'transparent' }]} />
      
      {!gameOver ? (
        <>
          {/* Header & Scores */}
          <View pointerEvents="none" style={styles.scoreContainerTop}>
            <Text style={[styles.scoreText, { color: p2Color, transform: [{rotate: '180deg'}] }]}>P2 SCORE: {scores.p2}</Text>
          </View>
          <View pointerEvents="none" style={styles.scoreContainerBottom}>
            <Text style={[styles.scoreText, { color: p1Color }]}>P1 SCORE: {scores.p1}</Text>
          </View>
          
          <View pointerEvents="none" style={styles.timerContainer}>
            <Text style={[styles.timerText, { color: timeLeft <= 5 ? '#FF2A54' : '#fff' }]}>{timeLeft}</Text>
          </View>
          
          {/* Main Target */}
          <Animated.View style={[
            styles.targetWrapper, 
            { 
              left: target.x, top: target.y, 
              width: target.size, height: target.size,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <View 
              style={[styles.target, { borderColor: activePlayer === 'p2' ? p2Color : p1Color }]}
              onTouchStart={(e) => { e.stopPropagation(); handleTap(e.nativeEvent.pageY > height / 2 ? 'p1' : 'p2'); }}
            >
              <View style={[styles.targetInner, { backgroundColor: activePlayer === 'p2' ? p2Color : p1Color }]} />
            </View>
          </Animated.View>
        </>
      ) : (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>
            {scores.p1 === scores.p2 ? "IT'S A TIE!" : `PLAYER ${scores.p1 > scores.p2 ? '1' : '2'} WINS!`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', width: '100%' },
  bgHalf: { position: 'absolute', width: '100%', height: '50%' },
  scoreContainerTop: { position: 'absolute', top: 50, width: '100%', alignItems: 'center' },
  scoreContainerBottom: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  scoreText: { fontSize: 32, fontWeight: '900', letterSpacing: 2, opacity: 0.8 },
  timerContainer: { position: 'absolute', top: height/2 - 40, width: '100%', alignItems: 'center', opacity: 0.2 },
  timerText: { fontSize: 80, fontWeight: '900' },
  targetWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  target: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  targetInner: {
    width: '50%',
    height: '50%',
    borderRadius: 100,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  gameOverText: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: 3, textAlign: 'center', textShadowColor: '#FF2A54', textShadowRadius: 20 }
});
