import { useState, useRef, useEffect } from 'react';
import { Animated, PanResponder, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BOARD_SIZE = width * 0.9;
const STRIKER_RADIUS = 15;
const COIN_RADIUS = 12;
const HOLE_RADIUS = 20;

const STRIKER_START = { x: BOARD_SIZE / 2, y: BOARD_SIZE - 40 };

export function useCarrom({ mode, onGameEnd }) {
  const [coins, setCoins] = useState([
    { id: 1, type: 'white', x: BOARD_SIZE / 2 - 15, y: BOARD_SIZE / 2 - 15, vx: 0, vy: 0 },
    { id: 2, type: 'black', x: BOARD_SIZE / 2 + 15, y: BOARD_SIZE / 2 - 15, vx: 0, vy: 0 },
    { id: 3, type: 'black', x: BOARD_SIZE / 2 - 15, y: BOARD_SIZE / 2 + 15, vx: 0, vy: 0 },
    { id: 4, type: 'white', x: BOARD_SIZE / 2 + 15, y: BOARD_SIZE / 2 + 15, vx: 0, vy: 0 },
    { id: 5, type: 'red', x: BOARD_SIZE / 2, y: BOARD_SIZE / 2, vx: 0, vy: 0 },
  ]);

  const [striker, setStriker] = useState({ ...STRIKER_START, vx: 0, vy: 0 });
  const [turn, setTurn] = useState('p1');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [isStriking, setIsStriking] = useState(false);

  const requestRef = useRef();

  // Basic Physics Update Loop
  const updatePhysics = () => {
    let newStriker = { ...striker };
    let newCoins = [...coins];
    let isMoving = false;
    let scoredTurn = null;

    // Distance Helper
    const dist = (p1, p2) => Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2);

    // Apply Velocity to Striker
    if (Math.abs(newStriker.vx) > 0.1 || Math.abs(newStriker.vy) > 0.1) {
      newStriker.x += newStriker.vx;
      newStriker.y += newStriker.vy;
      newStriker.vx *= 0.98; // Friction
      newStriker.vy *= 0.98;
      isMoving = true;

      // Board Bounds reflection
      if (newStriker.x < STRIKER_RADIUS || newStriker.x > BOARD_SIZE - STRIKER_RADIUS) {
        newStriker.vx *= -0.8;
        newStriker.x = Math.max(STRIKER_RADIUS, Math.min(newStriker.x, BOARD_SIZE - STRIKER_RADIUS));
      }
      if (newStriker.y < STRIKER_RADIUS || newStriker.y > BOARD_SIZE - STRIKER_RADIUS) {
        newStriker.vy *= -0.8;
        newStriker.y = Math.max(STRIKER_RADIUS, Math.min(newStriker.y, BOARD_SIZE - STRIKER_RADIUS));
      }
    } else {
      newStriker.vx = 0; newStriker.vy = 0;
    }

    // Apply Velocity to Coins
    for (let i = 0; i < newCoins.length; i++) {
      let c = newCoins[i];
      if (Math.abs(c.vx) > 0.1 || Math.abs(c.vy) > 0.1) {
        c.x += c.vx;
        c.y += c.vy;
        c.vx *= 0.98;
        c.vy *= 0.98;
        isMoving = true;

        if (c.x < COIN_RADIUS || c.x > BOARD_SIZE - COIN_RADIUS) {
          c.vx *= -0.8;
          c.x = Math.max(COIN_RADIUS, Math.min(c.x, BOARD_SIZE - COIN_RADIUS));
        }
        if (c.y < COIN_RADIUS || c.y > BOARD_SIZE - COIN_RADIUS) {
          c.vy *= -0.8;
          c.y = Math.max(COIN_RADIUS, Math.min(c.y, BOARD_SIZE - COIN_RADIUS));
        }
      } else {
        c.vx = 0; c.vy = 0;
      }
    }

    // Striker - Coin Collisions
    for (let i = 0; i < newCoins.length; i++) {
      let c = newCoins[i];
      const d = dist(newStriker, c);
      if (d < STRIKER_RADIUS + COIN_RADIUS) {
        // Simple momentum transfer
        const angle = Math.atan2(c.y - newStriker.y, c.x - newStriker.x);
        const force = Math.max(Math.sqrt(newStriker.vx**2 + newStriker.vy**2) * 0.8, 2);
        c.vx += Math.cos(angle) * force;
        c.vy += Math.sin(angle) * force;
        newStriker.vx *= 0.5;
        newStriker.vy *= 0.5;
        // Separate them
        const overlap = (STRIKER_RADIUS + COIN_RADIUS) - d;
        newStriker.x -= Math.cos(angle) * overlap * 0.5;
        newStriker.y -= Math.sin(angle) * overlap * 0.5;
      }
    }

    // Coin - Coin Collisions
    for (let i = 0; i < newCoins.length; i++) {
      for (let j = i + 1; j < newCoins.length; j++) {
        let c1 = newCoins[i];
        let c2 = newCoins[j];
        const d = dist(c1, c2);
        if (d < COIN_RADIUS * 2) {
          const angle = Math.atan2(c2.y - c1.y, c2.x - c1.x);
          const f1 = Math.sqrt(c1.vx**2 + c1.vy**2);
          const f2 = Math.sqrt(c2.vx**2 + c2.vy**2);
          c2.vx += Math.cos(angle) * f1 * 0.8;
          c2.vy += Math.sin(angle) * f1 * 0.8;
          c1.vx -= Math.cos(angle) * f2 * 0.8;
          c1.vy -= Math.sin(angle) * f2 * 0.8;
          const overlap = (COIN_RADIUS * 2) - d;
          c1.x -= Math.cos(angle) * overlap * 0.5;
          c1.y -= Math.sin(angle) * overlap * 0.5;
        }
      }
    }

    // Hole Logic (Corners)
    const holes = [
      {x: 0, y: 0}, {x: BOARD_SIZE, y: 0},
      {x: 0, y: BOARD_SIZE}, {x: BOARD_SIZE, y: BOARD_SIZE}
    ];

    let currentCoins = [];
    for (let i = 0; i < newCoins.length; i++) {
      let pocketed = false;
      for (let h of holes) {
        if (dist(newCoins[i], h) < HOLE_RADIUS * 1.5) {
          pocketed = true;
          scoredTurn = turn; // Current player gets a point
          break;
        }
      }
      if (!pocketed) {
        currentCoins.push(newCoins[i]);
      }
    }

    setStriker(newStriker);
    setCoins(currentCoins);

    // Turn logic when motion stops
    if (isMoving) {
      requestRef.current = requestAnimationFrame(updatePhysics);
    } else if (isStriking) {
      setIsStriking(false);
      // Reset Striker
      setStriker({ 
        x: STRIKER_START.x, 
        y: turn === 'p1' ? 40 : BOARD_SIZE - 40, 
        vx: 0, vy: 0 
      });

      if (scoredTurn) {
        let nextScores = { ...scores };
        nextScores[scoredTurn] += 10;
        setScores(nextScores);
      } else {
        setTurn(turn === 'p1' ? 'p2' : 'p1');
      }

      // Check win condition
      if (currentCoins.length === 0) {
        let winnerNum = scores.p1 > scores.p2 ? 1 : 2;
        if (scores.p1 === scores.p2) winnerNum = 0;
        onGameEnd(winnerNum);
      }
    }
  };

  const handleStrike = (dx, dy) => {
    if (isStriking) return;
    setIsStriking(true);
    setStriker(prev => ({
      ...prev,
      vx: -dx * 0.2, // Shoot in opposite drag direction
      vy: -dy * 0.2
    }));
    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    // Bot logic
    if (mode === 'bot' && turn === 'p2' && !isStriking) {
      const timer = setTimeout(() => {
        // Simple random strike
        const rdx = (Math.random() - 0.5) * 150;
        const rdy = Math.random() * 150; 
        handleStrike(rdx, -rdy); // Dragging UP visually meant to shoot DOWN usually
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, mode, isStriking]);

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return {
    coins, striker, turn, scores, handleStrike, isStriking,
    BOARD_SIZE, STRIKER_RADIUS, COIN_RADIUS, HOLE_RADIUS
  };
}
