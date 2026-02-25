import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';
import './TrophyRoom.css';

const KID_EMOJIS = { Jackson: '🐶', Natalie: '🐹', Brooke: '🐱' };

const TrophyRoom = ({ data, onBack }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0, rotateY: -90 },
    visible: {
      y: 0,
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className="trophy-room"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="trophy-header">
        <button className="icon-button back-button" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
        
        <motion.h1
          className="trophy-title gold-text"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <FaTrophy className="float" /> HALL OF FAME <FaTrophy className="float" />
        </motion.h1>
        
        <div style={{ width: '100px' }}></div>
      </div>

      <motion.div
        className="trophy-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {data.kids.map((kid, index) => {
          const trophies = data.trophy_counts[kid] || { "1": 0, "2": 0, "3": 0 };
          const total = parseInt(trophies["1"]) + parseInt(trophies["2"]) + parseInt(trophies["3"]);
          
          return (
            <motion.div
              key={kid}
              className="trophy-card glass-card"
              variants={cardVariants}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              {/* Kid Name */}
              <div className="trophy-kid-name">
                <h2>{KID_EMOJIS[kid]} {kid.toUpperCase()}</h2>
                <span className="total-trophies">{total} Total Trophies</span>
              </div>

              {/* Medal Display */}
              <div className="medals-container">
                <motion.div
                  className="medal-item"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="trophy-medal gold">🥇</div>
                  <span className="medal-count gold-text">{trophies["1"]}</span>
                  <span className="medal-label">1st Place</span>
                </motion.div>

                <motion.div
                  className="medal-item"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="trophy-medal silver">🥈</div>
                  <span className="medal-count" style={{ color: 'var(--accent-silver)' }}>
                    {trophies["2"]}
                  </span>
                  <span className="medal-label">2nd Place</span>
                </motion.div>

                <motion.div
                  className="medal-item"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="trophy-medal bronze">🥉</div>
                  <span className="medal-count" style={{ color: 'var(--accent-bronze)' }}>
                    {trophies["3"]}
                  </span>
                  <span className="medal-label">3rd Place</span>
                </motion.div>
              </div>

              {/* Decorative Stats */}
              <div className="trophy-stats">
                <div className="stat-bar">
                  <div 
                    className="stat-fill gold-fill"
                    style={{ width: `${total > 0 ? (trophies["1"] / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Decorative Elements */}
      <div className="trophy-decorations">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-trophy"
            style={{
              left: `${(i / 8) * 100}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrophyRoom;
