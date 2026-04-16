import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GameEngine from '../games/GameEngine';
import { useGlobalContext } from '../state/Store';
import CountdownOverlay from '../components/CountdownOverlay';
import { Theme } from '../theme/Theme';
import SoundManager from '../state/SoundManager';

export default function GamePlayScreen({ route, navigation }) {
  const { mode, gameId, gameQueue = [] } = route.params || {};
  const { tournament, advanceTournament, endTournament, settings } = useGlobalContext();
  const theme = Theme[settings.theme || 'dark'];
  const [isPlaying, setIsPlaying] = useState(false);
  
  const isTournament = mode === 'tournament';
  
  const activeGame = isTournament 
    ? tournament.gameQueue[tournament.currentGameIndex] 
    : gameId;

  const handleGameEnd = (winner) => {
    SoundManager.play('win');
    if (isTournament) {
      advanceTournament(winner);
      const nextIndex = tournament.currentGameIndex + 1;
      if (nextIndex >= tournament.gameQueue.length) {
        navigation.navigate('TournamentResult');
      } else {
        // Continue tournament loop
      }
    } else {
      // In quick play, maybe show a replay screen or just go back
      navigation.goBack();
    }
  };

  const handleQuit = () => {
    SoundManager.play('lose');
    if (isTournament) {
      endTournament();
    }
    navigation.goBack();
  };

  const activeQueue = isTournament ? tournament.gameQueue : [];
  const progressRatio = isTournament && activeQueue ? ((tournament.currentGameIndex) / activeQueue.length) * 100 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder, borderBottomWidth: 1 }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.goBackBackground }]} onPress={handleQuit}>
          <Ionicons name="exit-outline" size={24} color="#ff4757" />
          <Text style={styles.backButtonText}>QUIT</Text>
        </TouchableOpacity>

        {isTournament ? (
          <View style={styles.tournamentHeader}>
            <Text style={[styles.tournamentTitle, { color: theme.textPrimary }]}>Tournament</Text>
            <Text style={[styles.tournamentMatchInfo, { color: theme.textSecondary }]}>Match {tournament.currentGameIndex + 1} of {tournament.gameQueue.length}</Text>
          </View>
        ) : (
          <Text style={[styles.title, { color: theme.textPrimary }]}>Quick Play</Text>
        )}

        {isTournament ? (
          <View style={[styles.tournamentScoreBadge, { backgroundColor: theme.scoreBackground }]}>
            <Text style={styles.scoreP1}>{tournament.p1Score}</Text>
            <Text style={[styles.scoreDivider, { color: theme.textSecondary }]}>-</Text>
            <Text style={styles.scoreP2}>{tournament.p2Score}</Text>
          </View>
        ) : (
          <View style={{ width: 80 }} /> 
        )}
      </View>

      {isTournament && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: `${progressRatio}%` }]} />
        </View>
      )}

      <View style={styles.gameArea}>
        {!isPlaying ? (
          <CountdownOverlay onComplete={() => setIsPlaying(true)} />
        ) : (
          <GameEngine gameId={activeGame} mode={isTournament ? 'friend' : mode} onGameEnd={handleGameEnd} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  backButtonText: {
    color: '#ff4757',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tournamentHeader: {
    alignItems: 'center',
  },
  tournamentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tournamentMatchInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  tournamentScoreBadge: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: 'center',
  },
  scoreP1: {
    color: '#ff4757',
    fontWeight: 'bold',
  },
  scoreDivider: {
    fontSize: 16,
    marginHorizontal: 6,
    fontWeight: 'bold',
  },
  scoreP2: {
    color: '#3742fa',
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
  },
  gameArea: {
    flex: 1,
    backgroundColor: '#1e242b',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    marginTop: 10,
  }
});
