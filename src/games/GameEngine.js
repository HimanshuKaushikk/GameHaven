import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TicTacToe from './TicTacToe';
import AirHockey from './AirHockey';
import TapMatch from './TapMatch';
import MathClash from './MathClash';
import ColorTap from './ColorTap';
import PullTheRope from './PullTheRope';
import FourInARow from './FourInARow';
import RockPaperScissors from './RockPaperScissors';

export default function GameEngine({ gameId, mode, onGameEnd }) {
  switch (gameId) {
    case 'tictactoe':
      return <TicTacToe mode={mode} onGameEnd={onGameEnd} />;
    case 'airhockey':
      return <AirHockey mode={mode} onGameEnd={onGameEnd} />;
    case 'tapmatch':
      return <TapMatch mode={mode} onGameEnd={onGameEnd} />;
    case 'mathclash':
      return <MathClash mode={mode} onGameEnd={onGameEnd} />;
    case 'colortap':
      return <ColorTap mode={mode} onGameEnd={onGameEnd} />;
    case 'pulltherope':
      return <PullTheRope mode={mode} onGameEnd={onGameEnd} />;
    case 'fourinarow':
      return <FourInARow mode={mode} onGameEnd={onGameEnd} />;
    case 'rps':
      return <RockPaperScissors mode={mode} onGameEnd={onGameEnd} />;
    default:
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Game "{gameId}" not found!</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FF6B6B', fontSize: 20 }
});
