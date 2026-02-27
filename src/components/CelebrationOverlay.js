import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import './CelebrationOverlay.css';

const KID_EMOJIS = { Jackson: '🐶', Natalie: '🐿️', Brooke: '🐱' };
const CONFETTI_COLORS = ['#ffd700', '#00d4ff', '#7b2ff7', '#00ff88', '#ff3860', '#ffaa00', '#ff69b4', '#ffffff'];

const playFanfare = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  const note = (freq, start, duration, volume = 0.28, type = 'sine') => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  };

  const t = ctx.currentTime;

  // Drum hit — filtered noise burst
  const bufSize = ctx.sampleRate * 0.15;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 180;
  const noiseGain = ctx.createGain();
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseGain.gain.setValueAtTime(0.6, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  noise.start(t);
  noise.stop(t + 0.15);

  // Ascending fanfare — G4 B4 D5 G5
  const fanfare = [392, 493.88, 587.33, 783.99];
  fanfare.forEach((freq, i) => {
    note(freq, t + 0.05 + i * 0.13, 0.35, 0.25, 'triangle');
  });

  // Triumphant chord — G major sustained
  const chordT = t + 0.05 + fanfare.length * 0.13 + 0.08;
  [392, 493.88, 587.33, 783.99].forEach(freq => {
    note(freq, chordT, 2.2, 0.18, 'sine');
  });

  // Sparkle high notes
  [1318.51, 1567.98, 2093].forEach((freq, i) => {
    note(freq, chordT + i * 0.12, 0.6, 0.09, 'sine');
  });
};

const CelebrationOverlay = ({ kid, onDone }) => {

  const confetti = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: `${(i / 80) * 100 + (Math.sin(i) * 5)}%`,
      delay: `${(i % 30) * 0.1}s`,
      duration: `${2.5 + (i % 5) * 0.4}s`,
      width: `${6 + (i % 5) * 2}px`,
      height: `${10 + (i % 6) * 3}px`,
      circle: i % 3 === 0,
    })), []
  );

  useEffect(() => {
    playFanfare();
    const timer = setTimeout(onDone, 4000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="celebration-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {confetti.map(p => (
        <div
          key={p.id}
          className={`confetti-piece ${p.circle ? 'circle' : ''}`}
          style={{
            left: p.left,
            backgroundColor: p.color,
            width: p.width,
            height: p.height,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      <div className="celebration-content">
        <motion.div
          className="celebration-emoji"
          animate={{ scale: [1, 1.25, 0.95, 1.15, 1], rotate: [0, -15, 15, -8, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.4 }}
        >
          {KID_EMOJIS[kid] || '🌟'}
        </motion.div>

        <motion.h1
          className="celebration-title"
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}
        >
          MISSION COMPLETE!
        </motion.h1>

        <motion.h2
          className="celebration-name"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.35 }}
        >
          {kid.toUpperCase()}
        </motion.h2>

        <motion.div
          className="celebration-rank"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.6 }}
        >
          ✅ QUEST COMPLETE!
        </motion.div>

      </div>
    </motion.div>
  );
};

export default CelebrationOverlay;
