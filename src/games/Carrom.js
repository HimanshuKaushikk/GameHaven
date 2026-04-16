import React, { useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimension } from 'react-native';
import { useCarrom } from '../hooks/useCarrom';

export default function Carrom({ mode, onGameEnd }) {
  const { 
    coins, striker, turn, scores, handleStrike, isStriking,
    BOARD_SIZE, STRIKER_RADIUS, COIN_RADIUS, HOLE_RADIUS 
  } = useCarrom({ mode, onGameEnd });

  // Pan responder for drag mechanics
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isStriking && (mode === 'friend' || turn === 'p1'),
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        handleStrike(gestureState.dx, gestureState.dy);
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
    })
  ).current;

  return (
    <View style={styles.container}>
      <Text style={[styles.playerBanner, { top: 40, transform: [{rotate: '180deg'}] }]}>
        P2 SCORE: {scores.p2} {turn === 'p2' ? '(TURN)' : ''}
      </Text>

      <View style={[styles.boardWrapper, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        <View style={styles.woodBoard}>
          {/* Holes */}
          <View style={[styles.hole, { top: 5, left: 5 }]} />
          <View style={[styles.hole, { top: 5, right: 5 }]} />
          <View style={[styles.hole, { bottom: 5, left: 5 }]} />
          <View style={[styles.hole, { bottom: 5, right: 5 }]} />

          {/* Center Circle */}
          <View style={styles.centerCircle} />

          {/* Coins */}
          {coins.map((c) => (
            <View 
              key={c.id} 
              style={[
                styles.coin, 
                { 
                  width: COIN_RADIUS * 2, height: COIN_RADIUS * 2, borderRadius: COIN_RADIUS,
                  left: c.x - COIN_RADIUS, top: c.y - COIN_RADIUS,
                  backgroundColor: c.type === 'white' ? '#fde047' : c.type === 'black' ? '#1f2937' : '#ef4444'
                }
              ]} 
            />
          ))}

          {/* Striker */}
          <Animated.View 
            {...(turn === 'p1' || mode === 'friend' ? panResponder.panHandlers : {})}
            style={[
              styles.striker, 
              { 
                width: STRIKER_RADIUS * 2, height: STRIKER_RADIUS * 2, borderRadius: STRIKER_RADIUS,
                left: striker.x - STRIKER_RADIUS, 
                top: striker.y - STRIKER_RADIUS,
                transform: [{ translateX: pan.x }, { translateY: pan.y }]
              }
            ]} 
          >
            <View style={styles.strikerInner} />
          </Animated.View>
        </View>
      </View>

      <Text style={[styles.playerBanner, { bottom: 40 }]}>
        P1 SCORE: {scores.p1} {turn === 'p1' ? '(TURN)' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  playerBanner: { position: 'absolute', color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: 'bold', letterSpacing: 3 },
  boardWrapper: {
    padding: 15,
    backgroundColor: '#854d0e', // Dark wood border
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  woodBoard: {
    flex: 1,
    backgroundColor: '#fde047', // Light wood inner
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ca8a04'
  },
  hole: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#854d0e'
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ca8a04',
    transform: [{ translateX: -30 }, { translateY: -30 }]
  },
  coin: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 2,
  },
  striker: {
    position: 'absolute',
    backgroundColor: '#0284c7',
    borderWidth: 3,
    borderColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 4,
  },
  strikerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38bdf8'
  }
});
