import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../state/Store';
import { Theme } from '../theme/Theme';

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings } = useGlobalContext();
  const theme = Theme[settings.theme || 'dark'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.surfaceBorder }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>
          SYSTEM <Text style={[styles.headerTitleBold, { color: theme.textHighlight }]}>SETTINGS</Text>
        </Text>
        <View style={{ width: 28 }} />
      </View>
      
      <View style={styles.content}>
        <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, borderWidth: 1 }]}>
        <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
        <Switch 
          value={settings.theme === 'dark'} 
          onValueChange={(val) => updateSettings({ theme: val ? 'dark' : 'light' })}
          trackColor={{ false: "#767577", true: "#4ECDC4" }}
        />
      </View>

      <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, borderWidth: 1 }]}>
        <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Volume</Text>
        <Text style={[styles.settingValue, { color: theme.textHighlight }]}>{settings.volume}%</Text>
      </View>
      <View style={styles.volumeControls}>
        <Text style={styles.btn} onPress={() => updateSettings({ volume: Math.max(0, settings.volume - 10) })}>- 10</Text>
        <Text style={styles.btn} onPress={() => updateSettings({ volume: Math.min(100, settings.volume + 10) })}>+ 10</Text>
      </View>

      <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, borderWidth: 1 }]}>
        <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>60 FPS Mode</Text>
        <Switch 
          value={settings.fps === 60} 
          onValueChange={(val) => updateSettings({ fps: val ? 60 : 30 })}
          trackColor={{ false: "#767577", true: "#4ECDC4" }}
        />
      </View>

      <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, borderWidth: 1 }]}>
        <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Vibration</Text>
        <Switch 
          value={settings.vibration} 
          onValueChange={(val) => updateSettings({ vibration: val })}
          trackColor={{ false: "#767577", true: "#4ECDC4" }}
        />
      </View>

        <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, borderWidth: 1 }]}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Enable Ads</Text>
          <Switch 
            value={settings.ads} 
            onValueChange={(val) => updateSettings({ ads: val })}
            trackColor={{ false: "#767577", true: "#FF6B6B" }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    flex: 1,
    padding: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  settingLabel: { fontSize: 18, fontWeight: 'bold' },
  settingValue: { fontSize: 16 },
  volumeControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  btn: {
    color: '#fff',
    backgroundColor: '#4ECDC4',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
    fontWeight: 'bold',
  }
});
