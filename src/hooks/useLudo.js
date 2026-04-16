import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const PATH = [
  [5,6], [4,6], [3,6], [2,6], [1,6], [0,6], [0,7],
  [0,8], [1,8], [2,8], [3,8], [4,8], [5,8],
  [6,9], [6,10], [6,11], [6,12], [6,13], [6,14], [7,14],
  [8,14], [8,13], [8,12], [8,11], [8,10], [8,9],
  [9,8], [10,8], [11,8], [12,8], [13,8], [14,8], [14,7],
  [14,6], [13,6], [12,6], [11,6], [10,6], [9,6],
  [8,5], [8,4], [8,3], [8,2], [8,1], [8,0], [7,0],
  [6,0], [6,1], [6,2], [6,3], [6,4], [6,5]
];

const RED_PATH = [];
for (let i = 0; i < 51; i++) RED_PATH.push(PATH[(35 + i) % 52]);
RED_PATH.push(PATH[34]); // [14,7]
RED_PATH.push([13,7], [12,7], [11,7], [10,7], [9,7], [8,7]);

const BLUE_PATH = [];
for (let i = 0; i < 51; i++) BLUE_PATH.push(PATH[(9 + i) % 52]);
BLUE_PATH.push(PATH[6]); // [0,7]
BLUE_PATH.push([1,7], [2,7], [3,7], [4,7], [5,7], [6,7]);

const SAFE_SPOTS = [
  '6,1', '1,8', '8,13', '13,6',
  '8,2', '2,6', '6,12', '12,8'
];

export function useLudo({ mode, onGameEnd }) {
  const [redTokens, setRedTokens] = useState([-1, -1, -1, -1]);
  const [blueTokens, setBlueTokens] = useState([-1, -1, -1, -1]);
  const [turn, setTurn] = useState('red');
  const [diceValue, setDiceValue] = useState(1);
  const [gameState, setGameState] = useState('roll'); // 'roll', 'move'
  const [winner, setWinner] = useState(null);

  const diceRotate = useRef(new Animated.Value(0)).current;

  const rollDice = () => {
    if (gameState !== 'roll' || winner) return;
    
    // Animation
    diceRotate.setValue(0);
    Animated.sequence([
      Animated.timing(diceRotate, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(diceRotate, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(diceRotate, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(diceRotate, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setDiceValue(result);
      
      const currentTokens = turn === 'red' ? redTokens : blueTokens;
      
      // Auto logic
      let canMove = false;
      for (let pos of currentTokens) {
        if (pos === -1 && result === 6) canMove = true;
        if (pos > -1 && pos + result <= 57) canMove = true;
      }

      if (!canMove) {
        // Can't move anything, switch turn
        switchTurn(result);
      } else {
        setGameState('move');
      }
    });
  };

  const moveToken = (player, tokenIndex) => {
    if (gameState !== 'move' || player !== turn || winner) return;

    const currentTokens = player === 'red' ? [...redTokens] : [...blueTokens];
    const pos = currentTokens[tokenIndex];
    let newPos = pos;

    if (pos === -1) {
      if (diceValue !== 6) return; // Invalid move
      newPos = 0;
    } else {
      newPos = pos + diceValue;
      if (newPos > 57) return; // Invalid move
    }

    currentTokens[tokenIndex] = newPos;

    // Check collision / capture
    let captured = false;
    if (newPos > -1 && newPos < 51) {
      const targetCoord = player === 'red' ? RED_PATH[newPos] : BLUE_PATH[newPos];
      const targetStr = `${targetCoord[0]},${targetCoord[1]}`;
      
      if (!SAFE_SPOTS.includes(targetStr)) {
        // Check opponent tokens
        if (player === 'red') {
          const newBlue = [...blueTokens];
          for (let i = 0; i < 4; i++) {
            if (newBlue[i] > -1 && newBlue[i] < 51) {
              let opCoord = BLUE_PATH[newBlue[i]];
              if (`${opCoord[0]},${opCoord[1]}` === targetStr) {
                newBlue[i] = -1; // Captured!
                captured = true;
              }
            }
          }
          if (captured) setBlueTokens(newBlue);
        } else {
          const newRed = [...redTokens];
          for (let i = 0; i < 4; i++) {
            if (newRed[i] > -1 && newRed[i] < 51) {
              let opCoord = RED_PATH[newRed[i]];
              if (`${opCoord[0]},${opCoord[1]}` === targetStr) {
                newRed[i] = -1;
                captured = true;
              }
            }
          }
          if (captured) setRedTokens(newRed);
        }
      }
    }

    if (player === 'red') setRedTokens(currentTokens);
    else setBlueTokens(currentTokens);

    // Check win
    if (currentTokens.every(p => p === 57)) {
      const winPlayer = player === 'red' ? 1 : 2;
      setWinner(winPlayer);
      setTimeout(() => onGameEnd(winPlayer), 2000);
      return;
    }

    // Switch turn
    if (diceValue === 6 || captured) {
      // Gets another turn
      setGameState('roll');
    } else {
      switchTurn(diceValue);
    }
  };

  const switchTurn = (roll) => {
    setTurn(turn === 'red' ? 'blue' : 'red');
    setGameState('roll');
  };

  // Bot Logic
  useEffect(() => {
    if (mode === 'bot' && turn === 'blue' && !winner) {
      if (gameState === 'roll') {
        const timer = setTimeout(() => rollDice(), 800);
        return () => clearTimeout(timer);
      } else if (gameState === 'move') {
        const timer = setTimeout(() => {
          // Simplistic Bot AI:
          // 1. Try to spawn a token if roll == 6
          let moved = false;
          if (diceValue === 6) {
            let spawnIdx = blueTokens.findIndex(p => p === -1);
            if (spawnIdx !== -1) {
              moveToken('blue', spawnIdx);
              moved = true;
            }
          }
          // 2. Try to move the token closest to home without exceeding 57
          if (!moved) {
            let bestIdx = -1;
            let maxPos = -2;
            for (let i = 0; i < 4; i++) {
              if (blueTokens[i] > -1 && blueTokens[i] + diceValue <= 57) {
                if (blueTokens[i] > maxPos) {
                  maxPos = blueTokens[i];
                  bestIdx = i;
                }
              }
            }
            if (bestIdx !== -1) {
              moveToken('blue', bestIdx);
              moved = true;
            }
          }
          // If no move was possible, it should have been caught during roll phase,
          // but just in case, switch turn.
          if (!moved) switchTurn(diceValue);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [turn, gameState, mode, winner, blueTokens, diceValue]);

  return {
    redTokens, blueTokens, turn, diceValue, gameState, winner,
    diceRotate, rollDice, moveToken, RED_PATH, BLUE_PATH, SAFE_SPOTS, PATH
  };
}
