import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import './KidSelections.css';

const KID_EMOJIS = { Jackson: '🐶', Natalie: '🐿️', Brooke: '🐱' };

const KidSelections = ({ kid, data, mode, onBack }) => {
  const choices = data.choices[kid] || {};

  // ── Food (only for morning mode) ──────────────────────────────────────────
  const showFood = mode === 'morning';
  const foodSections = showFood
    ? [
        { label: '🍳 Breakfast',        items: choices.breakfast || [] },
        { label: '⭐ Special Breakfast', items: choices.special_breakfast || [] },
        { label: '🍎 Snacks',           items: choices.snacks || [] },
      ].filter(s => s.items.length > 0)
    : [];

  const lunchItems = showFood
    ? choices.school_lunch
      ? [{ label: '🏫 Buying School Lunch', tag: true }]
      : [
          ...(choices.lunch_main || []).map(i => ({ label: i, tag: false })),
          ...(choices.lunch_sides_healthy || []).map(i => ({ label: i, tag: false })),
          ...(choices.lunch_sides_unhealthy || []).map(i => ({ label: i, tag: false })),
        ]
    : [];

  const hasFood = foodSections.length > 0 || lunchItems.length > 0;

  // ── Tasks (only current mode's tasks) ─────────────────────────────────────
  const modeTaskList = data.tasks?.[mode]?.[kid] || [];
  const checklist = choices.checklist || {};
  const taskEntries = modeTaskList.map(t => [t, !!checklist[t]]);

  // ── Goals (only show completed ones from goal_log) ────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const goalLog = data.goal_log?.[kid] || [];
  const completedGoalNames = new Set(
    goalLog
      .filter(entry => {
        const date = typeof entry === 'object' && entry.date ? entry.date : null;
        return date === today;
      })
      .map(entry => (typeof entry === 'string' ? entry : entry.name))
  );
  const completedGoals = (data.goals?.[kid] || [])
    .map(g => (typeof g === 'string' ? { name: g, credits: 1 } : g))
    .filter(g => completedGoalNames.has(g.name));

  const hasAnything = hasFood || taskEntries.length > 0 || completedGoals.length > 0;

  return (
    <motion.div
      className="kid-selections"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
    >
      {/* Header */}
      <div className="selections-header">
        <button className="icon-button back-button" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="selections-title gradient-text">
          {KID_EMOJIS[kid]} {kid.toUpperCase()}'S STATUS
        </h1>
        <div style={{ width: '100px' }} />
      </div>

      {!hasAnything ? (
        <div className="selections-empty">
          <p>No quest activity yet for {kid}.</p>
          <p>Have them start their quest first!</p>
        </div>
      ) : (
        <div className="selections-grid">

          {/* Food Card — morning only */}
          {hasFood && (
            <motion.div
              className="sel-card glass-card"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="sel-card-title">FUEL PLAN 🍽️</h2>

              {foodSections.map(section => (
                <div key={section.label} className="sel-section">
                  <span className="sel-section-label">{section.label}</span>
                  <div className="sel-tags">
                    {section.items.map(item => (
                      <span key={item} className="sel-tag">{item}</span>
                    ))}
                  </div>
                </div>
              ))}

              {lunchItems.length > 0 && (
                <div className="sel-section">
                  <span className="sel-section-label">🥪 Lunch</span>
                  <div className="sel-tags">
                    {lunchItems.map((item, i) => (
                      <span
                        key={i}
                        className={`sel-tag ${item.tag ? 'sel-tag-school' : ''}`}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tasks Card — current mode only */}
          {taskEntries.length > 0 && (
            <motion.div
              className="sel-card glass-card"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="sel-card-title">
                {mode.toUpperCase()} TASK STATUS 📋
              </h2>
              <div className="sel-task-list">
                {taskEntries.map(([task, done]) => (
                  <div key={task} className={`sel-task-item ${done ? 'done' : ''}`}>
                    <span className="sel-task-check">{done ? '✅' : '⬜'}</span>
                    <span className="sel-task-label">{task}</span>
                  </div>
                ))}
              </div>
              <div className="sel-task-summary">
                {taskEntries.filter(([, v]) => v).length} / {taskEntries.length} Complete
              </div>
            </motion.div>
          )}

          {/* Completed Goals — today only */}
          {completedGoals.length > 0 && (
            <motion.div
              className="sel-card glass-card"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="sel-card-title">GOALS COMPLETED 🎯</h2>
              <div className="sel-task-list">
                {completedGoals.map((goal, i) => (
                  <div key={i} className="sel-task-item done">
                    <span className="sel-task-check">✅</span>
                    <span className="sel-task-label">{goal.name}</span>
                    <span className="sel-goal-credits">+{goal.credits} ✨</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      )}
    </motion.div>
  );
};

export default KidSelections;
