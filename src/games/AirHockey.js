import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, PanResponder } from 'react-native';
import SoundManager from '../state/SoundManager';

const { width, height } = Dimensions.get('window');

// Premium Air Hockey with Circular Vector Physics
export default function AirHockey({ mode, onGameEnd }) {
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameOver, setGameOver] = useState(false);
  
  const [, forceRender] = useState({});
  const touchTracker = useRef({});
  const gameState = useRef({
    p1: { x: width / 2, y: height - 120, r: 35, vx: 0, vy: 0 },
    p2: { x: width / 2, y: 120, r: 35, vx: 0, vy: 0 },
    puck: { x: width / 2, y: height / 2, r: 20, vx: 0, vy: 0 },
    lastTime: performance.now(),
  });

  const PADDLE_MASS = 2;
  const PUCK_MASS = 1;
  const FRICTION = 0.99;
  const MAX_PUCK_SPEED = 20;

  useEffect(() => {
    if (gameOver) return;
    
    // Initial serve
    resetPuck(Math.random() > 0.5 ? 1 : -1);

    let animationFrame;
    const loop = (timestamp) => {
      const state = gameState.current;
      const dt = 16; // Standardize delta time for physics stability
      state.lastTime = timestamp;

      // Update puck pos
      state.puck.x += state.puck.vx;
      state.puck.y += state.puck.vy;
      
      // Apply friction
      state.puck.vx *= FRICTION;
      state.puck.vy *= FRICTION;

      // Wall collision (Sides)
      if (state.puck.x - state.puck.r <= 0) {
        state.puck.x = state.puck.r;
        state.puck.vx *= -1;
      } else if (state.puck.x + state.puck.r >= width) {
        state.puck.x = width - state.puck.r;
        state.puck.vx *= -1;
      }

      // Goal dimensions
      const goalWidth = 140;
      const goalLeft = width / 2 - goalWidth / 2;
      const goalRight = width / 2 + goalWidth / 2;

      // Wall collision (Top / Bottom) & Goals
      if (state.puck.y - state.puck.r <= 0) {
        if (state.puck.x > goalLeft && state.puck.x < goalRight) {
          // Player 1 scores!
          SoundManager.play('win');
          setScores(s => { 
            const ns = { ...s, p1: s.p1 + 1 };
            checkWin(ns);
            return ns; 
          });
          resetPuck(1);
        } else {
          state.puck.y = state.puck.r;
          state.puck.vy *= -1;
        }
      } else if (state.puck.y + state.puck.r >= height) {
        if (state.puck.x > goalLeft && state.puck.x < goalRight) {
          // Player 2 scores!
          SoundManager.play('win');
          setScores(s => { 
            const ns = { ...s, p2: s.p2 + 1 };
            checkWin(ns);
            return ns;
          });
          resetPuck(-1);
        } else {
          state.puck.y = height - state.puck.r;
          state.puck.vy *= -1;
        }
      }

      // Circle Collision function
      const resolveCollision = (paddle, puck) => {
        const dx = puck.x - paddle.x;
        const dy = puck.y - paddle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = puck.r + paddle.r;

        if (distance < minDist) {
          // Resolve overlap
          const angle = Math.atan2(dy, dx);
          const overlap = minDist - distance;
          
          puck.x += Math.cos(angle) * overlap;
          puck.y += Math.sin(angle) * overlap;

          // Simple elastic physics approximation
          // Calculate relative velocity
          const rvx = puck.vx - paddle.vx;
          const rvy = puck.vy - paddle.vy;
          
          const velAlongNormal = rvx * Math.cos(angle) + rvy * Math.sin(angle);
          if (velAlongNormal > 0) return; // Moving away

          SoundManager.play('bounce');

          const restitution = 0.8;
          let impulse = -(1 + restitution) * velAlongNormal;
          impulse /= (1/PUCK_MASS + 1/PADDLE_MASS);

          const impulseX = impulse * Math.cos(angle);
          const impulseY = impulse * Math.sin(angle);

          puck.vx += impulseX / PUCK_MASS;
          puck.vy += impulseY / PUCK_MASS;

          // Speed cap
          const speed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy);
          if (speed > MAX_PUCK_SPEED) {
             puck.vx = (puck.vx / speed) * MAX_PUCK_SPEED;
             puck.vy = (puck.vy / speed) * MAX_PUCK_SPEED;
          }
        }
      };

      resolveCollision(state.p1, state.puck);
      resolveCollision(state.p2, state.puck);

      // Bot Logic
      if (mode === 'bot') {
        const botSpeed = 5;
        const targetY = state.puck.y < height / 2 ? state.puck.y : 120;
        
        // Save old position for velocity calculation
        const oldX = state.p2.x;
        const oldY = state.p2.y;

        // Move towards puck
        if (state.p2.x < state.puck.x - 10) state.p2.x += botSpeed;
        else if (state.p2.x > state.puck.x + 10) state.p2.x -= botSpeed;

        if (state.p2.y < targetY - 10) state.p2.y += botSpeed;
        else if (state.p2.y > targetY + 10) state.p2.y -= botSpeed;

        // Block crossing center line
        if (state.p2.y > height / 2 - state.p2.r - 10) state.p2.y = height / 2 - state.p2.r - 10;

        // Calculate paddle velocity for collision strength
        state.p2.vx = (state.p2.x - oldX);
        state.p2.vy = (state.p2.y - oldY);
      }

      forceRender({}); // Trigger re-render to update UI
      animationFrame = requestAnimationFrame(loop);
    };
    
    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [gameOver, mode]);

  const resetPuck = (dir) => {
    gameState.current.puck = {
      x: width / 2,
      y: height / 2,
      r: 20,
      vx: (Math.random() > 0.5 ? 2 : -2),
      vy: 4 * dir,
    };
    // Reset paddle positions mildly
    gameState.current.p1.x = width / 2;
    gameState.current.p1.y = height - 120;
    gameState.current.p2.x = width / 2;
    gameState.current.p2.y = 120;
  };

  const checkWin = (s) => {
    if (s.p1 >= 5) {
      setGameOver(true);
      setTimeout(() => onGameEnd(1), 1500);
    } else if (s.p2 >= 5) {
      setGameOver(true);
      setTimeout(() => onGameEnd(2), 1500);
    }
  };

  // Global Multi-Touch Tracker for Android Lockout Fix
  const globalPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e) => {
        const touches = e.nativeEvent.touches;
        const newTracker = {};

        // Reset velocities gracefully before scanning current frame
        gameState.current.p1.vx = 0;
        gameState.current.p1.vy = 0;
        if (mode === 'friend') {
          gameState.current.p2.vx = 0;
          gameState.current.p2.vy = 0;
        }

        touches.forEach(t => {
           let isP1 = t.pageY >= height / 2;
           if (!isP1 && mode !== 'friend') return; // Ignore top touches if Bot is playing
           
           let state = isP1 ? gameState.current.p1 : gameState.current.p2;

           const lastTouch = touchTracker.current[t.identifier];
           if (lastTouch) {
               state.vx = (t.pageX - lastTouch.x) * 3; // Emulate hit intensity
               state.vy = (t.pageY - lastTouch.y) * 3;
           }
           newTracker[t.identifier] = { x: t.pageX, y: t.pageY };

           let newX = t.pageX;
           let newY = t.pageY;

           // Clamping bounds
           if (newX - state.r < 0) newX = state.r;
           if (newX + state.r > width) newX = width - state.r;

           if (isP1) {
             if (newY - state.r < height / 2) newY = height / 2 + state.r;
             if (newY + state.r > height) newY = height - state.r;
           } else {
             if (newY + state.r > height / 2) newY = height / 2 - state.r;
             if (newY - state.r < 0) newY = state.r;
           }
           
           state.x = newX;
           state.y = newY;
        });

        touchTracker.current = newTracker;
      },
      onPanResponderRelease: () => {
         gameState.current.p1.vx = 0;
         gameState.current.p1.vy = 0;
         if (mode === 'friend') {
           gameState.current.p2.vx = 0;
           gameState.current.p2.vy = 0;
         }
         touchTracker.current = {};
      }
    })
  ).current;

  const s = gameState.current;

  return (
    <View style={styles.container} {...globalPanResponder.panHandlers}>
      {/* Board Layout */}
      <View style={styles.rinkContainer}>
        <View style={styles.rinkBorder}>
          <View style={[styles.goalTracker, styles.topGoal]} />
          <View style={[styles.goalTracker, styles.bottomGoal]} />
          <View style={styles.centerCircle} />
          <View style={styles.centerLine} />
        </View>
      </View>

      <Text style={styles.scoreTop}>{scores.p2}</Text>
      
      {/* Puck */}
      <View style={[styles.puck, { 
        left: s.puck.x - s.puck.r, 
        top: s.puck.y - s.puck.r,
        width: s.puck.r * 2,
        height: s.puck.r * 2,
      }]} />

      {/* Player 2 */}
      <View 
        style={[styles.paddle, styles.p2Paddle, { 
          left: s.p2.x - s.p2.r, 
          top: s.p2.y - s.p2.r,
          width: s.p2.r * 2,
          height: s.p2.r * 2,
        }]} 
      >
         <View style={styles.paddleHandle} />
      </View>

      {/* Player 1 */}
      <View 
        style={[styles.paddle, styles.p1Paddle, { 
          left: s.p1.x - s.p1.r, 
          top: s.p1.y - s.p1.r,
          width: s.p1.r * 2,
          height: s.p1.r * 2,
        }]} 
      >
         <View style={styles.paddleHandle} />
      </View>

      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>PLAYER {scores.p1 >= 5 ? '1' : '2'} WINS!</Text>
        </View>
      )}

      <Text style={styles.scoreBottom}>{scores.p1}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', width: '100%', position: 'relative' },
  rinkContainer: {
    ...StyleSheet.absoluteFillObject,
    padding: 10,
  },
  rinkBorder: {
    flex: 1,
    borderWidth: 4,
    borderColor: '#00F0FF',
    borderRadius: 20,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  centerLine: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: 4,
    backgroundColor: '#FF2A54',
    shadowColor: '#FF2A54',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FF2A54',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  goalTracker: {
    position: 'absolute',
    width: 144,
    height: 20,
    backgroundColor: '#1E293B',
    left: '50%',
    transform: [{ translateX: -72 }],
    borderWidth: 2,
    borderColor: '#00F0FF'
  },
  topGoal: {
    top: -4,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  bottomGoal: {
    bottom: -4,
    borderBottomWidth: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  paddle: {
    position: 'absolute',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  paddleHandle: {
    width: '40%',
    height: '40%',
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  p1Paddle: { 
    backgroundColor: '#FF2A54',
    borderColor: '#FFA5B8',
    shadowColor: '#FF2A54',
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  p2Paddle: { 
    backgroundColor: '#00F0FF',
    borderColor: '#B3FAFF',
    shadowColor: '#00F0FF',
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  puck: {
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: '#FFE66D',
    borderWidth: 3,
    borderColor: '#FFF5BA',
    shadowColor: '#FFE66D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
  },
  scoreTop: { position: 'absolute', top: 50, left: 30, fontSize: 60, fontWeight: '900', color: 'rgba(0, 240, 255, 0.4)', transform: [{rotate: '180deg'}] },
  scoreBottom: { position: 'absolute', bottom: 50, right: 30, fontSize: 60, fontWeight: '900', color: 'rgba(255, 42, 84, 0.4)' },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  gameOverText: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: 4, textShadowColor: '#FF2A54', textShadowRadius: 20 }
});
