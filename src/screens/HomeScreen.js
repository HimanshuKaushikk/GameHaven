import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalContext } from '../state/Store';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../theme/Theme';
import SoundManager from '../state/SoundManager';

const { width } = Dimensions.get('window');

const GAMES = [
  { id: 'tictactoe', title: 'TIC TAC TOE', icon: 'border-all', color: '#8b5cf6' },
  { id: 'airhockey', title: 'AIR HOCKEY', icon: 'hockey-puck', color: '#3b82f6' },
  { id: 'tapmatch', title: 'TAP MATCH', icon: 'hand-pointer', color: '#ec4899' },
  { id: 'mathclash', title: 'MATH CLASH', icon: 'calculator', color: '#10b981' },
  { id: 'colortap', title: 'COLOR TAP', icon: 'bullseye', color: '#f59e0b' },
  { id: 'pulltherope', title: 'PULL ROPE', icon: 'hands-helping', color: '#ef4444' },
  { id: 'fourinarow', title: '4 IN A ROW', icon: 'th-large', color: '#06b6d4' },
  { id: 'rps', title: 'RPS', icon: 'hand-scissors', color: '#10b981' },
];

export default function HomeScreen({ navigation }) {
  const { scores, startTournament, settings } = useGlobalContext();
  const theme = Theme[settings.theme || 'dark'];
  const isDark = settings.theme === 'dark';

  useFocusEffect(
    useCallback(() => {
      SoundManager.startBackgroundMusic('piano');
      
      return () => {
        SoundManager.stopBackgroundMusic();
      };
    }, [])
  );

  const handleGameSelect = (game) => {
    SoundManager.play('tap');
    navigation.navigate('GameSelection', { game });
  };

  const handleTournamentClick = () => {
    SoundManager.play('win');
    const queue = [];
    for (let i = 0; i < 5; i++) {
       const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
       queue.push(randomGame.id);
    }
    startTournament(queue);
    navigation.navigate('GamePlay', { mode: 'tournament', gameQueue: queue });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Sleek Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: theme.iconBackground, borderColor: theme.surfaceBorder }]} 
          onPress={() => {
            SoundManager.play('tap');
            navigation.navigate('Settings');
          }}
        >
          <Ionicons name="options-outline" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>GAME<Text style={[styles.headerTitleBold, { color: theme.textHighlight }]}>HAVEN</Text></Text>
          <View style={styles.titleUnderline} />
        </View>

        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.iconBackground, borderColor: theme.surfaceBorder }]}>
          <Ionicons name="person-outline" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>COLLECTION</Text>

      {/* Game Grid */}
      <FlatList
        data={GAMES}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]} 
              onPress={() => handleGameSelect(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }]}>
                <FontAwesome5 name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Bottom Bar (Glassmorphic) */}
      <View style={[styles.floatingBottomBar, { backgroundColor: theme.pillBackground, borderColor: theme.surfaceBorder }]}>
        <View style={[styles.scorePill, { backgroundColor: theme.scoreBackground }]}>
          <Text style={[styles.playerLabel, { color: '#ef4444' }]}>P1</Text>
          <Text style={[styles.scoreText, { color: theme.textPrimary }]}>{scores.player1}</Text>
        </View>

        <TouchableOpacity 
          style={styles.tournamentButton} 
          onPress={handleTournamentClick}
          activeOpacity={0.8}
        >
          <Ionicons name="aperture" size={20} color="#fff" />
          <Text style={styles.tournamentText}>TOURNAMENT</Text>
        </TouchableOpacity>

        <View style={[styles.scorePill, { backgroundColor: theme.scoreBackground }]}>
          <Text style={[styles.scoreText, { color: theme.textPrimary }]}>{scores.player2}</Text>
          <Text style={[styles.playerLabel, { color: '#3b82f6', marginLeft: 8, marginRight: 0 }]}>P2</Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    letterSpacing: 4,
    fontWeight: '300',
  },
  headerTitleBold: {
    fontWeight: '700',
  },
  titleUnderline: {
    width: 24,
    height: 2,
    backgroundColor: '#8b5cf6',
    marginTop: 6,
    borderRadius: 2,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '600',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120, // space for floating bar
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardWrapper: {
    width: (width - 48) / 2, // 2 columns with padding
  },
  card: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05, // super soft shadow for bottom bar
    shadowRadius: 20,
    elevation: 10,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  playerLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginRight: 8,
    letterSpacing: 1,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '500',
  },
  tournamentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  tournamentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginLeft: 8,
  }
});
