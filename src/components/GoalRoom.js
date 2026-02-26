import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBullseye } from 'react-icons/fa';
import './GoalRoom.css';

const GoalRoom = ({ data, onSave, onBack }) => {
  const [pendingGoal, setPendingGoal] = useState(null);
  const [goalPassword, setGoalPassword] = useState('');
  const [goalPasswordError, setGoalPasswordError] = useState(false);

  const getLastAchievedDate = (kid, goalName) => {
    const log = data.goal_log[kid] || [];
    for (let i = log.length - 1; i >= 0; i--) {
      const entry = log[i];
      const name = typeof entry === 'string' ? entry : entry.name;
      if (name === goalName) {
        const date = typeof entry === 'object' && entry.date ? entry.date : null;
        if (date) {
          return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return null;
      }
    }
    return null;
  };

  const handleGoalClick = (kid, goalName, credits) => {
    setPendingGoal({ kid, goalName, credits });
    setGoalPassword('');
    setGoalPasswordError(false);
  };

  const handleGoalApprove = () => {
    if (goalPassword !== (data.config?.password || '1234')) {
      setGoalPasswordError(true);
      setGoalPassword('');
      return;
    }

    const { kid, goalName, credits } = pendingGoal;
    const today = new Date().toISOString().split('T')[0];

    const newData = { ...data };
    newData.credits = { ...data.credits };
    newData.credits[kid] = (newData.credits[kid] || 0) + credits;

    newData.goal_log = { ...data.goal_log };
    if (!newData.goal_log[kid]) newData.goal_log[kid] = [];
    newData.goal_log[kid] = [...newData.goal_log[kid], { name: goalName, date: today }];

    onSave(newData);
    setPendingGoal(null);
  };

  return (
    <motion.div
      className="goal-room"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Goal Approval Modal */}
      {pendingGoal && (
        <div className="password-overlay" onClick={() => setPendingGoal(null)}>
          <div className="password-modal glass-card" onClick={e => e.stopPropagation()}>
            <h2>🔒 Parent Approval</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
              Approve goal: <strong>{pendingGoal.goalName}</strong>
              <br />
              <span style={{ fontSize: '0.85rem' }}>
                Award <strong>✨ {pendingGoal.credits}</strong> credits to {pendingGoal.kid}
              </span>
            </p>
            <input
              className="password-input"
              type="password"
              placeholder="Enter password"
              value={goalPassword}
              onChange={e => { setGoalPassword(e.target.value); setGoalPasswordError(false); }}
              onKeyDown={e => e.key === 'Enter' && handleGoalApprove()}
              autoFocus
            />
            {goalPasswordError && <p className="password-error">Incorrect password</p>}
            <div className="password-actions">
              <button className="neon-button" onClick={handleGoalApprove}>Approve</button>
              <button className="icon-button" onClick={() => setPendingGoal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="goal-header">
        <button className="icon-button back-button" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>

        <motion.h1
          className="goal-title gradient-text"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <FaBullseye /> GOAL ROOM
        </motion.h1>

        <div style={{ width: '100px' }}></div>
      </div>

      <div className="goals-grid">
        {data.kids.map((kid, index) => {
          const goals = (data.goals?.[kid] || []).map(g =>
            typeof g === 'string' ? { name: g, credits: 1 } : g
          );

          return (
            <motion.div
              key={kid}
              className="goal-card glass-card"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="goal-kid-name">{kid.toUpperCase()}</h2>
              <div className="goal-kid-credits">✨ {data.credits[kid] || 0} credits</div>

              <div className="goals-list">
                {goals.length === 0 ? (
                  <p className="no-goals">No goals set yet...</p>
                ) : (
                  goals.map((goal, i) => {
                    const lastDate = getLastAchievedDate(kid, goal.name);
                    return (
                      <motion.div
                        key={goal.name}
                        className="goal-item goal-selectable"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleGoalClick(kid, goal.name, goal.credits)}
                      >
                        <span className="goal-icon">🎯</span>
                        <div className="goal-info">
                          <span className="goal-text">{goal.name}</span>
                          {lastDate && (
                            <span className="goal-last-date">Last: {lastDate}</span>
                          )}
                        </div>
                        <span className="goal-credits-badge">✨ {goal.credits}</span>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GoalRoom;
