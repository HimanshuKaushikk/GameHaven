import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTicTacToe } from '../hooks/useTicTacToe';
import SoundManager from '../state/SoundManager';

const Cell = ({ cell, onPress, isWinningCell }) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cell) {
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      scale.setValue(0);
    }
  }, [cell]);

  return (
    <TouchableOpacity 
      style={[styles.cell, isWinningCell && styles.winningCell]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {cell === 'X' && (
          <Text style={[styles.cellText, styles.textX, isWinningCell && styles.glowTextX]}>X</Text>
        )}
        {cell === 'O' && (
          <Text style={[styles.cellText, styles.textO, isWinningCell && styles.glowTextO]}>O</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function TicTacToe({ mode, onGameEnd }) {
  const { board, isXNext, winner, handlePress } = useTicTacToe({ mode, onGameEnd });

  // Calculate winner manually just to highlight cells
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  let winningLine = [];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winningLine = lines[i];
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBox}>
        <Text style={[styles.status, { color: isXNext ? '#FF2A54' : '#00F0FF' }]}>
          {winner ? (winner === 'Draw' ? "IT's A TIE!" : `P${winner === 'X' ? '1' : '2'} WINS!`) : `P${isXNext ? '1' : '2'} TURN`}
        </Text>
      </View>
      
      <View style={styles.boardOuter}>
        <View style={styles.boardInner}>
          {board.map((cell, idx) => (
            <Cell 
              key={idx} 
              cell={cell} 
              onPress={() => {
                SoundManager.play('tap');
                handlePress(idx);
              }}
              isWinningCell={winningLine.includes(idx)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  statusBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  status: { fontSize: 24, fontWeight: '900', letterSpacing: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  boardOuter: {
    padding: 15,
    backgroundColor: 'rgba(20, 25, 40, 0.4)',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  boardInner: {
    width: 300,
    height: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between'
  },
  cell: {
    width: 90,
    height: 90,
    backgroundColor: 'rgba(10, 15, 30, 0.7)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  winningCell: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.4)',
    transform: [{ scale: 1.05 }],
  },
  cellText: { fontSize: 60, fontWeight: '900' },
  textX: { color: '#FF2A54', textShadowColor: 'rgba(255, 42, 84, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  textO: { color: '#00F0FF', textShadowColor: 'rgba(0, 240, 255, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  glowTextX: { textShadowColor: '#FF2A54', textShadowRadius: 25 },
  glowTextO: { textShadowColor: '#00F0FF', textShadowRadius: 25 },
});
