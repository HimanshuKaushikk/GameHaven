import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useGlobalContext } from '../state/Store';
import { Ionicons } from '@expo/vector-icons';

export default function TournamentResultScreen({ navigation }) {
  const { tournament, endTournament, updateScores, scores } = useGlobalContext();

  const handleFinish = () => {
    // Add tournament wins to overall global scores
    const p1Wins = tournament.p1Score > tournament.p2Score ? 1 : 0;
    const p2Wins = tournament.p2Score > tournament.p1Score ? 1 : 0;
    updateScores(scores.player1 + p1Wins, scores.player2 + p2Wins);
    
    endTournament();
    navigation.navigate('Home');
  };

  let winnerText = "It's a Draw!";
  if (tournament.p1Score > tournament.p2Score) winnerText = "Player 1 Wins!";
  if (tournament.p2Score > tournament.p1Score) winnerText = "Player 2 Wins!";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="trophy" size={120} color="#FFD700" />
        <Text style={styles.title}>Tournament Over</Text>
        <Text style={styles.winnerText}>{winnerText}</Text>
        
        <View style={styles.scoreBoard}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Player 1</Text>
            <Text style={styles.scoreNumber}>{tournament.p1Score}</Text>
          </View>
          <Text style={styles.vs}>-</Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Player 2</Text>
            <Text style={styles.scoreNumber}>{tournament.p2Score}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={handleFinish}>
          <Text style={styles.homeBtnText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 20 },
  winnerText: { fontSize: 24, fontWeight: 'bold', color: '#4ECDC4', marginTop: 10, marginBottom: 40 },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    padding: 30,
    borderRadius: 20,
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 50,
  },
  scoreBox: { alignItems: 'center' },
  scoreLabel: { color: '#aaa', fontSize: 16, marginBottom: 10 },
  scoreNumber: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  vs: { color: '#FF6B6B', fontSize: 32, fontWeight: 'bold' },
  homeBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  homeBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
