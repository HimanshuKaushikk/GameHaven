import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useGlobalContext } from '../state/Store';
import { Theme } from '../theme/Theme';

export default function GameSelectionScreen({ route, navigation }) {
  const { game } = route.params;
  const { settings } = useGlobalContext();
  const theme = Theme[settings.theme || 'dark'];

  const handleStart = (mode) => {
    navigation.navigate('GamePlay', { mode, gameId: game.id });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: theme.surfaceBorder }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>
          SELECT <Text style={[styles.headerTitleBold, { color: theme.textHighlight }]}>MODE</Text>
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Title Card */}
        <View style={[styles.gameHeaderCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <View style={[styles.iconWrapper, { backgroundColor: `${game.color}15` }]}>
            <FontAwesome5 name={game.icon} size={60} color={game.color} />
          </View>
          <Text style={[styles.gameTitle, { color: theme.textPrimary }]}>{game.title}</Text>
        </View>

        {/* Vs Bot Card */}
        <TouchableOpacity 
          style={[styles.modeCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]} 
          onPress={() => handleStart('bot')}
          activeOpacity={0.8}
        >
          <View style={[styles.modeIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <FontAwesome5 name="robot" size={36} color="#10b981" />
          </View>
          <Text style={[styles.modeTitle, { color: theme.textPrimary }]}>VS BOT</Text>
          <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>Play against AI in a single match</Text>
        </TouchableOpacity>

        {/* Vs Friend Card */}
        <TouchableOpacity 
          style={[styles.modeCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]} 
          onPress={() => handleStart('friend')}
          activeOpacity={0.8}
        >
          <View style={[styles.modeIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <MaterialIcons name="people" size={42} color="#3b82f6" />
          </View>
          <Text style={[styles.modeTitle, { color: theme.textPrimary }]}>VS FRIEND</Text>
          <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>Pass and play on the same screen</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    letterSpacing: 3,
    fontWeight: '300',
  },
  headerTitleBold: {
    fontWeight: '700',
  },
  content: {
    padding: 24,
    gap: 20,
  },
  gameHeaderCard: {
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  modeCard: {
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  modeIconBox: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  modeDesc: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});
