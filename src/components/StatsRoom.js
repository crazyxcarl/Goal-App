import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import './StatsRoom.css';

const KID_EMOJIS = { Jackson: '🐶', Natalie: '🐿️', Brooke: '🐱' };

const pad = n => String(n).padStart(2, '0');

const formatTime = ts => {
  const d = new Date(ts);
  const h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${pad(m)} ${ampm}`;
};

const minsOfDay = ts => {
  const d = new Date(ts);
  return d.getHours() * 60 + d.getMinutes();
};

const calcStreak = log => {
  const dates = [...new Set(log.map(e => e.date))].sort().reverse();
  if (!dates.length) return 0;
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let cursor = today;
  for (const date of dates) {
    if (date === cursor) {
      streak++;
      const d = new Date(cursor + 'T12:00:00');
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().split('T')[0];
    } else if (date < cursor) break;
  }
  return streak;
};

const computeStats = (kid, data) => {
  const log = (data.completion_log?.[kid] || []);
  const morningLog = log.filter(e => e.mode === 'morning');
  const cfg = data.config || {};
  const deadlineMins = (cfg.pm_hour || 19) * 60 + (cfg.pm_min || 0);

  const totalQuests = log.length;
  const streak = calcStreak(log);

  const morningMins = morningLog.map(e => minsOfDay(e.time));
  const avgMins = morningMins.length
    ? Math.round(morningMins.reduce((a, b) => a + b, 0) / morningMins.length)
    : null;
  const bestMins = morningMins.length ? Math.min(...morningMins) : null;

  const onTime = morningLog.filter(e => minsOfDay(e.time) < deadlineMins).length;
  const onTimeRate = morningLog.length
    ? Math.round((onTime / morningLog.length) * 100)
    : null;

  const avgBefore = morningMins.length
    ? Math.round(morningMins.reduce((a, m) => a + (deadlineMins - m), 0) / morningMins.length)
    : null;

  const redeemed = (data.redeemed?.[kid] || []);
  const lifetimeCredits = (data.credits?.[kid] || 0) +
    redeemed.reduce((sum, r) => sum + (r.cost || 0), 0);

  const minsToTime = mins => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${pad(m)} ${ampm}`;
  };

  return {
    totalQuests,
    streak,
    avgFinish: avgMins !== null ? minsToTime(avgMins) : '—',
    bestFinish: bestMins !== null ? minsToTime(bestMins) : '—',
    onTimeRate: onTimeRate !== null ? `${onTimeRate}%` : '—',
    avgBefore: avgBefore !== null
      ? avgBefore >= 60
        ? `${Math.floor(avgBefore / 60)}h ${avgBefore % 60}m`
        : `${avgBefore}m`
      : '—',
    lifetimeCredits,
    rewardsClaimed: redeemed.length,
    morningCount: morningLog.length,
  };
};

const StatTile = ({ icon, label, value, accent }) => (
  <div className={`stat-tile ${accent ? `accent-${accent}` : ''}`}>
    <div className="stat-tile-icon">{icon}</div>
    <div className="stat-tile-value">{value}</div>
    <div className="stat-tile-label">{label}</div>
  </div>
);

const StatsRoom = ({ data, onBack }) => {
  return (
    <motion.div
      className="stats-room"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="stats-header">
        <button className="icon-button back-button" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
        <motion.h1
          className="stats-title gradient-text"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
        >
          📊 STATS ROOM
        </motion.h1>
        <div style={{ width: '100px' }} />
      </div>

      <div className="stats-grid">
        {data.kids.map((kid, i) => {
          const s = computeStats(kid, data);
          return (
            <motion.div
              key={kid}
              className="stats-card glass-card"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 100, damping: 14 }}
            >
              <div className="stats-kid-header">
                <span className="stats-kid-emoji">{KID_EMOJIS[kid]}</span>
                <h2 className="stats-kid-name">{kid.toUpperCase()}</h2>
              </div>

              <div className="stat-tiles">
                <StatTile icon="🔥" label="Quest Streak" value={s.streak === 0 ? '—' : `${s.streak} day${s.streak !== 1 ? 's' : ''}`} accent="gold" />
                <StatTile icon="🏆" label="Total Quests" value={s.totalQuests || '—'} accent="cyan" />
                <StatTile icon="🌅" label="Avg Finish Time" value={s.avgFinish} accent="purple" />
                <StatTile icon="🚀" label="Best Finish" value={s.bestFinish} accent="green" />
                <StatTile icon="⏱️" label="Avg Before Deadline" value={s.avgBefore} accent="cyan" />
                <StatTile icon="🎯" label="On-Time Rate" value={s.onTimeRate} accent="green" />
                <StatTile icon="💰" label="Lifetime Credits" value={s.lifetimeCredits} accent="gold" />
                <StatTile icon="🎁" label="Rewards Claimed" value={s.rewardsClaimed || '—'} accent="purple" />
              </div>

              {s.totalQuests === 0 && (
                <p className="stats-no-data">Complete a quest to start tracking stats!</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StatsRoom;
