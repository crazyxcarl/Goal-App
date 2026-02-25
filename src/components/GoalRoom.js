import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBullseye } from 'react-icons/fa';
import './GoalRoom.css';

const GoalRoom = ({ data, onBack }) => {
  return (
    <motion.div
      className="goal-room"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="goal-header">
        <button className="icon-button back-button" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
        
        <motion.h1
          className="goal-title gradient-text"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <FaBullseye /> MISSION ACHIEVEMENTS
        </motion.h1>
        
        <div style={{ width: '100px' }}></div>
      </div>

      <div className="goals-grid">
        {data.kids.map((kid, index) => {
          const goals = data.goal_log[kid] || [];
          
          return (
            <motion.div
              key={kid}
              className="goal-card glass-card"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="goal-kid-name">{kid.toUpperCase()}</h2>
              
              <div className="goals-list">
                {goals.length === 0 ? (
                  <p className="no-goals">No goals achieved yet... 🎯</p>
                ) : (
                  goals.map((goal, i) => (
                    <motion.div
                      key={i}
                      className="goal-item"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <span className="goal-check">✅</span>
                      <span className="goal-text">{goal}</span>
                    </motion.div>
                  ))
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
