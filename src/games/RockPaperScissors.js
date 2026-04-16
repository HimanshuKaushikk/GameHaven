import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AnimatedButton from '../components/AnimatedButton';

const CHOICES = [
  { id: 'rock', icon: 'hand-rock', color: '#ef4444' }, // Red
  { id: 'paper', icon: 'hand-paper', color: '#3b82f6' }, // Blue
  { id: 'scissors', icon: 'hand-scissors', color: '#10b981' } // Green
];

export default function RockPaperScissors({ mode, onGameEnd }) {
  const [p1Choice, setP1Choice] = useState(null);
  const [p2Choice, setP2Choice] = useState(null);
  const [winner, setWinner] = useState(null); // 0 draw, 1 p1, 2 p2
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [step, setStep] = useState('select'); // select -> reveal

  const p1RevealOffset = useRef(new Animated.Value(300)).current;
  const p2RevealOffset = useRef(new Animated.Value(-300)).current;
  const VSScale = useRef(new Animated.Value(0)).current;

  const determineWinner = (c1, c2) => {
    if (c1 === c2) return 0;
    if (
      (c1 === 'rock' && c2 === 'scissors') ||
      (c1 === 'paper' && c2 === 'rock') ||
      (c1 === 'scissors' && c2 === 'paper')
    ) {
      return 1;
    }
    return 2;
  };

  const handleSelection = (player, choice) => {
    if (step !== 'select') return;

    if (player === 'p1') setP1Choice(choice);
    if (mode === 'friend' && player === 'p2') setP2Choice(choice);
  };

  useEffect(() => {
    if (step === 'select') {
      if (mode === 'friend' && p1Choice && p2Choice) {
        processRound(p1Choice, p2Choice);
      } else if (mode === 'bot' && p1Choice) {
        const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
        setP2Choice(botChoice);
        processRound(p1Choice, botChoice);
      }
    }
  }, [p1Choice, p2Choice, step, mode]);

  const processRound = (c1, c2) => {
    setStep('reveal');
    
    p1RevealOffset.setValue(300);
    p2RevealOffset.setValue(-300);
    VSScale.setValue(0);
    
    // Animate Reveals
    Animated.parallel([
      Animated.spring(p1RevealOffset, { toValue: 0, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.spring(p2RevealOffset, { toValue: 0, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.spring(VSScale, { toValue: 1, friction: 3, tension: 150, useNativeDriver: true })
    ]).start();

    const rdWinner = determineWinner(c1, c2);
    setWinner(rdWinner);
    
    let newScores = { ...scores };
    if (rdWinner === 1) newScores.p1 += 1;
    if (rdWinner === 2) newScores.p2 += 1;
    setScores(newScores);

    setTimeout(() => {
      if (newScores.p1 >= 3) {
        onGameEnd(1);
      } else if (newScores.p2 >= 3) {
        onGameEnd(2);
      } else {
        Animated.parallel([
          Animated.timing(p1RevealOffset, { toValue: 300, duration: 300, useNativeDriver: true }),
          Animated.timing(p2RevealOffset, { toValue: -300, duration: 300, useNativeDriver: true }),
          Animated.timing(VSScale, { toValue: 0, duration: 300, useNativeDriver: true })
        ]).start(() => {
          setStep('select');
          setP1Choice(null);
          setP2Choice(null);
          setWinner(null);
        });
      }
    }, 2500);
  };

  const renderChoiceButtons = (player) => {
    if (player === 'p2' && mode === 'bot') {
      return <Text style={styles.botWaitingText}>{step === 'select' ? "BOT EVALUATING..." : ""}</Text>;
    }

    const currentChoice = player === 'p1' ? p1Choice : p2Choice;
    const isReady = currentChoice !== null;

    if (isReady && step === 'select') {
      return <Text style={styles.readyText}>LOCKED IN</Text>;
    }

    return (
      <View style={styles.choicesRow}>
        {CHOICES.map(c => (
          <AnimatedButton key={c.id} onPress={() => handleSelection(player, c.id)}>
            <View style={[styles.choiceBtn, { backgroundColor: c.color, shadowColor: c.color }]}>
              <FontAwesome5 name={c.icon} size={32} color="#fff" />
            </View>
          </AnimatedButton>
        ))}
      </View>
    );
  };

  const getIconForChoice = (choiceId) => {
    const matched = CHOICES.find(c => c.id === choiceId);
    return matched ? matched.icon : 'question';
  };

  const getColorForChoice = (choiceId) => {
    const matched = CHOICES.find(c => c.id === choiceId);
    return matched ? matched.color : '#fff';
  };

  return (
    <View style={styles.container}>
      {/* Player 2 Area (Top) */}
      <View style={[styles.half, styles.p2Half]}>
        <Text style={[styles.scoreText, { transform: [{rotate: '180deg'}] }]}>P2 SCORE: {scores.p2}</Text>
        
        {step === 'reveal' ? (
          <Animated.View style={[styles.revealBox, { transform: [{rotate: '180deg'}, { translateY: p2RevealOffset }] }, { borderColor: getColorForChoice(p2Choice) }]}>
            <FontAwesome5 name={getIconForChoice(p2Choice)} size={80} color={getColorForChoice(p2Choice)} />
          </Animated.View>
        ) : (
          <View style={[styles.selectionArea, { transform: [{rotate: '180deg'}] }]}>
            {renderChoiceButtons('p2')}
          </View>
        )}
      </View>

      <View style={styles.divider}>
        {step === 'select' ? (
           <Text style={styles.centerText}>CHOOSE WEAPON</Text>
        ) : (
           <Animated.View style={[styles.resultBadge, { transform: [{ scale: VSScale }] }]}>
              <Text style={styles.resultText}>
                {winner === 0 ? "DRAW!" : `P${winner} WINS`}
              </Text>
           </Animated.View>
        )}
      </View>

      {/* Player 1 Area (Bottom) */}
      <View style={[styles.half, styles.p1Half]}>
        {step === 'reveal' ? (
          <Animated.View style={[styles.revealBox, { transform: [{ translateY: p1RevealOffset }] }, { borderColor: getColorForChoice(p1Choice) }]}>
            <FontAwesome5 name={getIconForChoice(p1Choice)} size={80} color={getColorForChoice(p1Choice)} />
          </Animated.View>
        ) : (
          <View style={styles.selectionArea}>
            {renderChoiceButtons('p1')}
          </View>
        )}
        <Text style={styles.scoreText}>P1 SCORE: {scores.p1}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', width: '100%' },
  half: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  p2Half: { backgroundColor: 'rgba(0, 240, 255, 0.05)' },
  p1Half: { backgroundColor: 'rgba(255, 42, 84, 0.05)' },
  divider: {
    height: 80,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#1E293B'
  },
  centerText: { color: 'rgba(255,255,255,0.5)', fontSize: 20, fontWeight: '900', letterSpacing: 4 },
  resultBadge: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#FFE66D',
    borderRadius: 30,
    shadowColor: '#FFE66D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  resultText: { color: '#000', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  choicesRow: { flexDirection: 'row', gap: 20 },
  choiceBtn: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 15, elevation: 8,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)'
  },
  selectionArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  readyText: { fontSize: 32, fontWeight: '900', color: '#00F0FF', letterSpacing: 4, textShadowColor: '#00F0FF', textShadowRadius: 10 },
  botWaitingText: { fontSize: 24, fontWeight: '900', color: 'rgba(255,255,255,0.3)', letterSpacing: 2 },
  revealBox: {
    padding: 40, backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderRadius: 30, borderWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20
  },
  scoreText: { color: 'rgba(255,255,255,0.7)', fontSize: 20, fontWeight: '900', letterSpacing: 2, position: 'absolute', bottom: 30 }
});
