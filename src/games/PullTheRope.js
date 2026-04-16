import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { height } = Dimensions.get('window');

// High-Adrenaline Energy Tug of War
export default function PullTheRope({ mode, onGameEnd }) {
  const [gameOver, setGameOver] = useState(false);
  
  // Use a ref to track actual score logic to prevent infinite re-renders during spam tapping
  const matchScore = useRef(0);
  const animPos = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const pullValue = 4; // reduced pull value for more taps
  const winThreshold = 100;

  const handlePull = (player) => {
    if (gameOver) return;
    
    // Shake effect
    shakeAnim.setValue(0);
    Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }).start();

    const pullAmt = player === 'p1' ? pullValue : -pullValue;
    matchScore.current = matchScore.current + pullAmt;

    Animated.spring(animPos, {
      toValue: matchScore.current,
      friction: 6,
      tension: 100,
      useNativeDriver: true
    }).start();

    if (matchScore.current >= winThreshold) endGame(1);
    else if (matchScore.current <= -winThreshold) endGame(2);
  };

  const endGame = (winner) => {
    setGameOver(true);
    setTimeout(() => onGameEnd(winner), 2000);
  };

  // Bot Logic: Ramps up speed slightly as they start losing
  useEffect(() => {
    if (mode === 'bot' && !gameOver) {
      const botLoop = () => {
        if (gameOver) return;
        handlePull('p2');
        
        let delay = 140; // Base speed
        if (matchScore.current > 30) delay = 110; // Try harder if losing
        if (matchScore.current > 70) delay = 90; // Panic mode

        botTimeout = setTimeout(botLoop, delay + (Math.random() * 20));
      };
      
      let botTimeout = setTimeout(botLoop, 150);
      return () => clearTimeout(botTimeout);
    }
  }, [mode, gameOver]);

  // Interpolations
  // animPos goes from -100 to 100. Let's map it to pixel translation
  // If winner is at +- 100, that should map to roughly +- (height/3)
  const maxTravel = height / 3;
  const translateY = animPos.interpolate({
    inputRange: [-100, 100],
    outputRange: [-maxTravel, maxTravel],
    extrapolate: 'clamp'
  });

  const shakeTranslateX = shakeAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -5, 5, -5, 0]
  });

  return (
    <View style={styles.container}>
      <View 
        style={[styles.half, styles.p2Half, (mode === 'bot' || gameOver) && { opacity: 0.8 }]} 
        onTouchStart={() => {
           if (mode === 'friend' && !gameOver) handlePull('p2');
        }}
      >
        <Text style={[styles.tapText, { transform: [{rotate: '180deg'}], color: '#00F0FF' }]}>TAP FAST!</Text>
      </View>
      
      <View style={styles.ropeContainer} pointerEvents="none">
        {/* Core Energy Beam */}
        <Animated.View style={[styles.beam, { transform: [{ translateX: shakeTranslateX }] }]}>
          <View style={[styles.beamHalf, { backgroundColor: '#00F0FF' }]} />
          <View style={[styles.beamHalf, { backgroundColor: '#FF2A54' }]} />
        </Animated.View>

        {/* Center Nexus Marker */}
        <Animated.View style={[styles.markerBase, { transform: [{ translateY }, { translateX: shakeTranslateX }] }]}>
           <View style={styles.markerGlow} />
           <View style={styles.markerInner} />
        </Animated.View>
      </View>

      <View 
        style={[styles.half, styles.p1Half, gameOver && { opacity: 0.8 }]} 
        onTouchStart={() => {
           if (!gameOver) handlePull('p1');
        }}
      >
        <Text style={[styles.tapText, { color: '#FF2A54' }]}>TAP FAST!</Text>
      </View>

      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.winnerText}>PLAYER {matchScore.current > 0 ? '1' : '2'} WINS!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', backgroundColor: '#0B0F19' },
  half: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  p2Half: { backgroundColor: 'rgba(0, 240, 255, 0.05)' },
  p1Half: { backgroundColor: 'rgba(255, 42, 84, 0.05)' },
  tapText: { fontSize: 44, fontWeight: '900', letterSpacing: 4, opacity: 0.5 },
  ropeContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  beam: {
    width: 6,
    height: '100%',
    flexDirection: 'column',
    shadowColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  beamHalf: {
    flex: 1,
    width: '100%',
  },
  markerBase: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerGlow: {
    width: 80,
    height: 80,
    backgroundColor: '#FFE66D',
    borderRadius: 40,
    opacity: 0.3,
    position: 'absolute',
    transform: [{ scaleX: 2 }],
  },
  markerInner: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FFE66D',
    shadowColor: '#FFE66D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  gameOverOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0, right: 0,
    marginTop: -40,
    backgroundColor: 'rgba(11, 15, 25, 0.9)',
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  winnerText: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: 3, textShadowColor: '#FFE66D', textShadowRadius: 15 }
});
