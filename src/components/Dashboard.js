import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaBullseye, FaCog } from 'react-icons/fa';
import './Dashboard.css';

const KID_EMOJIS = { Jackson: '🐶', Natalie: '🐿️', Brooke: '🐱' };

const Dashboard = ({ data, mode, onKidSelect, onStoreSelect, onSelectionsSelect, onTrophyRoom, onGoalRoom, onAdminPanel }) => {
  const [countdown, setCountdown] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleAdminClick = () => {
    setPasswordInput('');
    setPasswordError(false);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === (data.config?.password || '1234')) {
      setShowPasswordModal(false);
      onAdminPanel();
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  useEffect(() => {
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data.config, mode]);

  const updateCountdown = () => {
    const now = new Date();
    const config = data.config;
    const pad = n => String(n).padStart(2, '0');

    if (mode === 'weekend') {
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const h = now.getHours();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      setCountdown(`${days[now.getDay()]} · ${h12}:${pad(now.getMinutes())} ${ampm} · FREE PLAY 🎮`);
      return;
    }

    if (mode === 'afternoon') {
      const target = new Date();
      target.setHours(config.pm_hour, config.pm_min, 0, 0);
      if (now >= target) target.setDate(target.getDate() + 1);
      const diff = target - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`EVENING IN ${pad(hours)}:${pad(minutes)}:${pad(seconds)} · STAY SHARP ⚡`);
      return;
    }

    const target = new Date();
    target.setHours(config.am_hour, config.am_min, 0, 0);
    if (now.getHours() >= config.pm_hour) {
      target.setDate(target.getDate() + 1);
    } else if (now > target) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setCountdown(`T-MINUS ${pad(hours)}:${pad(minutes)}:${pad(seconds)} TO LAUNCH 🚀`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-buttons">
          <button className="icon-button" onClick={onTrophyRoom}>
            <FaTrophy /> Stats Room
          </button>
          <button className="icon-button" onClick={onGoalRoom}>
            <FaBullseye /> Goal Room
          </button>
        </div>
        
        <motion.div
          className="header-title"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80 }}
        >
          <h1 className="gradient-text">
            {mode === 'weekend' ? 'WEEKEND QUEST' : mode === 'afternoon' ? 'AFTERNOON QUEST' : 'MORNING QUEST'} ✨
          </h1>
          <div className="countdown gold-text">
            {countdown}
          </div>
        </motion.div>

        <button className="icon-button admin-button" onClick={handleAdminClick}>
          <FaCog /> Admin
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="password-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="password-modal glass-card" onClick={e => e.stopPropagation()}>
            <h2>🔒 Admin Access</h2>
            <input
              className="password-input"
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
              onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
              autoFocus
            />
            {passwordError && <p className="password-error">Incorrect password</p>}
            <div className="password-actions">
              <button className="neon-button" onClick={handlePasswordSubmit}>Unlock</button>
              <button className="icon-button" onClick={() => setShowPasswordModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Kid Cards Grid */}
      <motion.div
        className="kids-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {data.kids.map((kid, index) => (
          <KidCard
            key={kid}
            kid={kid}
            data={data}
            mode={mode}
            onSelect={() => onKidSelect(kid)}
            onStore={() => onStoreSelect(kid)}
            onSelections={() => onSelectionsSelect(kid)}
            variants={cardVariants}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

const KidCard = ({ kid, data, mode, onSelect, onStore, onSelections, variants }) => {
  const choices = data.choices[kid] || {};
  const credits = data.credits[kid] || 0;

  const isCompletedToday = (() => {
    const today = new Date().toISOString().split('T')[0];
    const ct = data.completion_times[kid];
    return ct && data.last_date[kid] === today &&
      new Date(ct).toISOString().split('T')[0] === today;
  })();

  const getTaskProgress = () => {
    const checklist = choices.checklist || {};
    const taskList = data.tasks?.[mode]?.[kid] || [];
    const total = taskList.length;
    if (total === 0) return null;
    const completed = taskList.filter(t => checklist[t]).length;
    return { percent: (completed / total) * 100, completed, total };
  };

  const getFoodProgress = () => {
    if (mode !== 'morning') return null;
    const food = data.food || {};
    const schoolLunch = choices.school_lunch;
    const sections = [
      { available: (food.breakfast || []).length > 0,            done: (choices.breakfast || []).length > 0 },
      { available: (food.special_breakfast || []).length > 0,    done: (choices.special_breakfast || []).length > 0 },
      { available: (food.snacks || []).length > 0,               done: (choices.snacks || []).length > 0 },
      { available: true,                                         done: true }, // school_lunch toggle always decided
      ...(!schoolLunch ? [
        { available: (food.lunch_main || []).length > 0,           done: (choices.lunch_main || []).length > 0 },
        { available: (food.lunch_sides_healthy || []).length > 0,  done: (choices.lunch_sides_healthy || []).length > 0 },
        { available: (food.lunch_sides_unhealthy || []).length > 0,done: (choices.lunch_sides_unhealthy || []).length > 0 },
      ] : []),
    ].filter(s => s.available);
    const total = sections.length;
    const completed = sections.filter(s => s.done).length;
    return total > 0 ? { percent: (completed / total) * 100, completed, total } : null;
  };

  return (
    <motion.div
      className="kid-card glass-card"
      variants={variants}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Completion Status */}
      <motion.div
        className={`completion-status ${isCompletedToday ? 'completed' : ''}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isCompletedToday ? '✅ COMPLETED' : '⬜ NOT COMPLETED'}
      </motion.div>

      {/* Avatar */}
      <div className="kid-avatar">
        <motion.div
          className="avatar-circle"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {KID_EMOJIS[kid] || kid.charAt(0)}
        </motion.div>
        <div className="avatar-glow"></div>
      </div>

      {/* Name */}
      <h2 className="kid-name">{kid.toUpperCase()}</h2>

      {/* Credits */}
      <div className="credits-display">
        ✨ {credits} Credits
      </div>

      {/* Quest Info */}
      <div className="quest-info">
        {Object.keys(choices).length > 0 ? (
          <>
            {(() => {
              const fp = getFoodProgress();
              if (!fp) return null;
              return (
                <div className="progress-item">
                  <div className="progress-label">
                    <span>🍳 Food</span>
                    <span>{Math.round(fp.percent)}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill food-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${fp.percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })()}
            {(() => {
              const tp = getTaskProgress();
              if (!tp) return null;
              return (
                <div className="progress-item">
                  <div className="progress-label">
                    <span>📋 Tasks</span>
                    <span>{Math.round(tp.percent)}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${tp.percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })()}
            <button className="neon-button selections-button" onClick={onSelections}>
              📋 VIEW SELECTIONS
            </button>
          </>
        ) : (
          <div className="ready-message">READY FOR ADVENTURE!</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="card-actions">
        <motion.button
          className="neon-button quest-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSelect}
        >
          {Object.keys(choices).length > 0 ? 'RESUME QUEST' : 'START QUEST'}
        </motion.button>
        <motion.button
          className="neon-button store-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStore}
        >
          🛒 STORE
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Dashboard;
