import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { useLudo } from '../hooks/useLudo';
import { FontAwesome5 } from '@expo/vector-icons';
import AnimatedButton from '../components/AnimatedButton';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.floor(width * 0.95);
const BOARD_BORDER = 4;
const INNER_BOARD_SIZE = BOARD_SIZE - (BOARD_BORDER * 2);
const CELL_SIZE = INNER_BOARD_SIZE / 15;

const colors = {
  yellow: '#ffcf54',
  yellowInner: '#ffebb3',
  blue: '#16b2f5',
  blueInner: '#bcebfe',
  red: '#ef5458',
  redInner: '#ffc1c4',
  green: '#74c538',
  greenInner: '#c4eca0',
  border: '#333333',
  bg: '#5ca2bd'
};

export default function Ludo({ mode, onGameEnd }) {
  const { 
    redTokens, blueTokens, turn, diceValue, gameState, winner,
    diceRotate, rollDice, moveToken, RED_PATH, BLUE_PATH, SAFE_SPOTS, PATH
  } = useLudo({ mode, onGameEnd });

  const renderCells = () => {
    const cells = [];
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if ((r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8)) continue;
        if (r >= 6 && r <= 8 && c >= 6 && c <= 8) continue;

        let bgColor = '#fff';
        const str = `${r},${c}`;
        
        // Stars
        let isStar = false;
        let starColor = '#ccc';
        if (str === '6,1' || str === '8,2') { bgColor = colors.yellow; isStar = true; starColor = 'rgba(255,255,255,0.7)'; }
        if (str === '1,8' || str === '2,6') { bgColor = colors.blue; isStar = true; starColor = 'rgba(255,255,255,0.7)'; }
        if (str === '13,6' || str === '12,8') { bgColor = colors.red; isStar = true; starColor = 'rgba(255,255,255,0.7)'; }
        if (str === '8,13' || str === '6,12') { bgColor = colors.green; isStar = true; starColor = 'rgba(255,255,255,0.7)'; }

        // Home Paths
        if (c === 7 && r >= 1 && r <= 5) bgColor = colors.blue; 
        if (r === 7 && c >= 1 && c <= 5) bgColor = colors.yellow; 
        if (r === 7 && c >= 9 && c <= 13) bgColor = colors.green; 
        if (c === 7 && r >= 9 && r <= 13) bgColor = colors.red; 

        // Arrows (We will draw icons)
        let isArrow = false;
        let arrowDir = ''; 
        let arrowColor = '';
        if (str === '0,7') { isArrow = true; arrowDir = 'arrow-down'; arrowColor = colors.blueInner; }
        if (str === '7,0') { isArrow = true; arrowDir = 'arrow-right'; arrowColor = colors.yellowInner; }
        if (str === '14,7') { isArrow = true; arrowDir = 'arrow-up'; arrowColor = colors.redInner; }
        if (str === '7,14') { isArrow = true; arrowDir = 'arrow-left'; arrowColor = colors.greenInner; }

        cells.push(
          <View key={str} style={[styles.cell, { left: c * CELL_SIZE, top: r * CELL_SIZE, backgroundColor: bgColor }]}>
            {isStar && <FontAwesome5 name="star" size={14} color={starColor} />}
            {isArrow && <FontAwesome5 name={arrowDir} size={16} color={arrowColor} />}
          </View>
        );
      }
    }
    return cells;
  };

  const renderEmptyBaseGrid = (bgColor) => {
    const positions = [
      { top: '15%', left: '15%' },
      { top: '15%', right: '15%' },
      { bottom: '15%', left: '15%' },
      { bottom: '15%', right: '15%' },
    ];
    return (
      <View style={styles.baseInnerGrid}>
        {positions.map((pos, pI) => (
          <View key={`empty-${pI}`} style={[styles.emptyTokenCircle, pos, { backgroundColor: bgColor }]} />
        ))}
      </View>
    );
  };

  const renderBaseTokens = (player, tokensArray) => {
    const isRed = player === 'red';
    const color = isRed ? colors.red : colors.blue;
    const items = [];
    const positions = [
      { top: '15%', left: '15%' },
      { top: '15%', right: '15%' },
      { bottom: '15%', left: '15%' },
      { bottom: '15%', right: '15%' },
    ];

    tokensArray.forEach((pos, i) => {
      if (pos === -1) {
        items.push(
          <TouchableOpacity 
            key={`${player}-${i}`} 
            style={[styles.baseTokenHolder, positions[i]]}
            onPress={() => moveToken(player, i)}
            activeOpacity={0.7}
          >
            <View style={[styles.tokenWrapper, { backgroundColor: color }]}>
               <View style={styles.tokenCrescent} />
            </View>
            {turn === player && gameState === 'move' && diceValue === 6 && (
              <View style={styles.highlight} />
            )}
          </TouchableOpacity>
        );
      }
    });

    return (
      <View style={styles.baseInnerGrid}>
        {positions.map((pos, pI) => (
          <View key={`empty-${pI}`} style={[styles.emptyTokenCircle, pos, { backgroundColor: isRed ? 'rgba(2ef,84,88,0.2)' : 'rgba(255,255,255,0.4)' }]} />
        ))}
        {items}
      </View>
    );
  };

  const spin = diceRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg']
  });

  const getDiceIcon = (val) => {
    switch(val) {
      case 1: return 'dice-one';
      case 2: return 'dice-two';
      case 3: return 'dice-three';
      case 4: return 'dice-four';
      case 5: return 'dice-five';
      case 6: return 'dice-six';
      default: return 'dice-one';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.playerBannerTop}>P2 {mode === 'bot' ? '(BOT)' : ''}</Text>

      <View style={styles.boardArea}>
        <View style={styles.topBar}>
          <Text style={styles.rollText}>ROLL</Text>
          <View style={styles.whiteBox}><FontAwesome5 name="star" size={24} color={colors.blue} /></View>
        </View>

        <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
          {renderCells()}

          {/* Bases - Exactly positioned using the grid matrix to prevent border overlap drift */}
          <View style={[styles.base, { backgroundColor: colors.yellow, left: 0, top: 0 }]}>
            <View style={[styles.baseInnerSquare, { backgroundColor: colors.yellowInner }]}>
               {renderEmptyBaseGrid('rgba(255,207,84,0.4)')}
            </View>
          </View>
          <View style={[styles.base, { backgroundColor: colors.blue, left: 9 * CELL_SIZE, top: 0 }]}>
            <View style={[styles.baseInnerSquare, { backgroundColor: colors.blueInner }]}>
              {renderBaseTokens('blue', blueTokens)}
            </View>
          </View>
          <View style={[styles.base, { backgroundColor: colors.red, left: 0, top: 9 * CELL_SIZE }]}>
            <View style={[styles.baseInnerSquare, { backgroundColor: colors.redInner }]}>
              {renderBaseTokens('red', redTokens)}
            </View>
          </View>
          <View style={[styles.base, { backgroundColor: colors.green, left: 9 * CELL_SIZE, top: 9 * CELL_SIZE }]}>
            <View style={[styles.baseInnerSquare, { backgroundColor: colors.greenInner }]}>
               {renderEmptyBaseGrid('rgba(116,197,56,0.3)')}
            </View>
          </View>

          {/* Center */}
          <View style={[styles.centerArea, { left: 6 * CELL_SIZE, top: 6 * CELL_SIZE }]}>
             <View style={styles.centerTriangles}>
               <View style={[styles.triangleTop, { borderTopColor: colors.blue }]} />
               <View style={[styles.triangleBottom, { borderBottomColor: colors.red }]} />
               <View style={[styles.triangleLeft, { borderLeftColor: colors.yellow }]} />
               <View style={[styles.triangleRight, { borderRightColor: colors.green }]} />
             </View>
          </View>

          {/* Active Tokens on Path */}
          {redTokens.map((pos, i) => {
            if (pos > -1 && pos < 57) {
              const coord = RED_PATH[pos];
              return (
                <TouchableOpacity
                  key={`red-path-${i}`}
                  style={[styles.pathToken, { left: coord[1] * CELL_SIZE, top: coord[0] * CELL_SIZE }]}
                  onPress={() => moveToken('red', i)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.tokenWrapper, { backgroundColor: colors.red }]}>
                     <View style={styles.tokenCrescent} />
                  </View>
                  {turn === 'red' && gameState === 'move' && pos + diceValue <= 57 && (
                    <View style={styles.highlight} />
                  )}
                </TouchableOpacity>
              )
            }
            return null;
          })}

          {blueTokens.map((pos, i) => {
            if (pos > -1 && pos < 57) {
              const coord = BLUE_PATH[pos];
              return (
                <TouchableOpacity
                  key={`blue-path-${i}`}
                  style={[styles.pathToken, { left: coord[1] * CELL_SIZE, top: coord[0] * CELL_SIZE }]}
                  onPress={() => moveToken('blue', i)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.tokenWrapper, { backgroundColor: colors.blue }]}>
                     <View style={styles.tokenCrescent} />
                  </View>
                  {turn === 'blue' && gameState === 'move' && pos + diceValue <= 57 && (
                    <View style={styles.highlight} />
                  )}
                </TouchableOpacity>
              )
            }
            return null;
          })}
        </View>
      </View>

      {/* Dice Area */}
      <View style={styles.diceContainer}>
        {winner ? (
          <Text style={styles.winnerText}>PLAYER {winner} WINS!</Text>
        ) : (
          <AnimatedButton 
            onPress={() => (mode === 'friend' || turn === 'red') ? rollDice() : null}
            disabled={gameState !== 'roll' || (mode === 'bot' && turn === 'blue')}
          >
            <View style={styles.diceOuterBtn}>
              <Animated.View style={[styles.diceBtn, { transform: [{ rotate: spin }] }]}>
                 <FontAwesome5 name={getDiceIcon(diceValue)} size={50} color={turn === 'red' ? colors.red : colors.blue} />
              </Animated.View>
            </View>
          </AnimatedButton>
        )}
      </View>
      
      <Text style={styles.playerBannerBottom}>P1 (YOU)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  playerBannerTop: { position: 'absolute', top: 50, color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 3, opacity: 0.8 },
  playerBannerBottom: { position: 'absolute', bottom: 30, color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  boardArea: {
    alignItems: 'center',
    marginBottom: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: BOARD_SIZE,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: -40,
  },
  rollText: {
    backgroundColor: '#0369a1',
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    letterSpacing: 2,
    borderWidth: 2,
    borderColor: '#0284c7'
  },
  whiteBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: colors.border
  },
  board: {
    backgroundColor: '#fff',
    borderWidth: BOARD_BORDER,
    borderColor: colors.border,
    position: 'relative'
  },
  cell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  base: {
    position: 'absolute',
    width: CELL_SIZE * 6,
    height: CELL_SIZE * 6,
    padding: CELL_SIZE * 0.9, // Adjust padding for correct inner square size
    borderWidth: 1,
    borderColor: colors.border,
  },
  baseInnerSquare: {
    flex: 1,
    borderRadius: 18,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  baseInnerGrid: {
    flex: 1,
    position: 'relative'
  },
  emptyTokenCircle: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  baseTokenHolder: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  centerArea: {
    position: 'absolute',
    width: CELL_SIZE * 3,
    height: CELL_SIZE * 3,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  centerTriangles: {
    width: '100%', height: '100%', position: 'relative'
  },
  triangleTop: {
    position: 'absolute', top: 0, left: 0, width: 0, height: 0,
    borderLeftWidth: CELL_SIZE * 1.5, borderRightWidth: CELL_SIZE * 1.5,
    borderTopWidth: CELL_SIZE * 1.5, borderLeftColor: 'transparent',
    borderRightColor: 'transparent'
  },
  triangleBottom: {
    position: 'absolute', bottom: 0, left: 0, width: 0, height: 0,
    borderLeftWidth: CELL_SIZE * 1.5, borderRightWidth: CELL_SIZE * 1.5,
    borderBottomWidth: CELL_SIZE * 1.5, borderLeftColor: 'transparent',
    borderRightColor: 'transparent'
  },
  triangleLeft: {
    position: 'absolute', top: 0, left: 0, width: 0, height: 0,
    borderTopWidth: CELL_SIZE * 1.5, borderBottomWidth: CELL_SIZE * 1.5,
    borderLeftWidth: CELL_SIZE * 1.5, borderTopColor: 'transparent',
    borderBottomColor: 'transparent'
  },
  triangleRight: {
    position: 'absolute', top: 0, right: 0, width: 0, height: 0,
    borderTopWidth: CELL_SIZE * 1.5, borderBottomWidth: CELL_SIZE * 1.5,
    borderRightWidth: CELL_SIZE * 1.5, borderTopColor: 'transparent',
    borderBottomColor: 'transparent'
  },
  pathToken: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20
  },
  tokenWrapper: {
    width: CELL_SIZE * 0.75,
    height: CELL_SIZE * 0.75,
    borderRadius: CELL_SIZE * 0.375,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    overflow: 'hidden'
  },
  tokenCrescent: {
    width: '100%',
    height: '100%',
    borderRadius: CELL_SIZE * 0.375,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.5)',
    transform: [{ translateX: -1 }, { translateY: -2 }]
  },
  highlight: {
    position: 'absolute',
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff',
    shadowColor: '#fff', shadowOpacity: 1, shadowRadius: 5
  },
  diceContainer: {
    position: 'absolute',
    bottom: -80, // Hang below the board a bit
    alignItems: 'center',
    zIndex: 20
  },
  diceOuterBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  diceBtn: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  winnerText: { color: colors.bg, fontSize: 24, fontWeight: '900', letterSpacing: 4, backgroundColor: 'rgba(0,0,0,0.8)', padding: 15, borderRadius: 10 },
});
