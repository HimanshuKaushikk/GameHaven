import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useFourInARow } from '../hooks/useFourInARow';

const Chip = ({ player }) => {
  const translateY = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.chip, 
        player === 1 ? styles.p1Cell : styles.p2Cell,
        { transform: [{ translateY }] }
      ]} 
    />
  );
};

export default function FourInARow({ mode, onGameEnd }) {
  const { board, turn, winner, handleColumnPress, COLS } = useFourInARow({ mode, onGameEnd });

  return (
    <View style={styles.container}>
      <View style={styles.statusBox}>
        <Text style={[styles.status, { color: turn === 1 ? '#FF2A54' : '#00F0FF' }]}>
          {winner === 0 ? `P${turn} TURN` : (winner === 3 ? "IT'S A DRAW!" : `P${winner} WINS!`)}
        </Text>
      </View>

      <View style={styles.boardContainer}>
        {Array.from({ length: COLS }).map((_, colIdx) => (
          <TouchableOpacity 
            key={colIdx} 
            style={styles.column} 
            onPress={() => mode === 'friend' || turn === 1 ? handleColumnPress(colIdx) : null}
            activeOpacity={0.8}
          >
            {board.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.cellHole}>
                {row[colIdx] !== 0 && <Chip player={row[colIdx]} />}
              </View>
            ))}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', alignItems: 'center', justifyContent: 'center', width: '100%' },
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
  boardContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 89, 219, 0.7)', // Translucent blue plastic
    padding: 10,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#0b59db',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden'
  },
  column: {
    paddingHorizontal: 4,
  },
  cellHole: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0B0F19', // The background color to act as a "hole"
    marginVertical: 4,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  chip: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    borderWidth: 2,
  },
  p1Cell: { 
    backgroundColor: '#FF2A54',
    borderColor: '#FFA5B8',
  },
  p2Cell: { 
    backgroundColor: '#00F0FF',
    borderColor: '#B3FAFF',
  },
});
