import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import './RewardStore.css';

const KID_EMOJIS = { Jackson: '🐶', Natalie: '🐿️', Brooke: '🐱' };

const RewardStore = ({ kid, data, onSave, onBack }) => {
  const credits = data.credits[kid] || 0;
  const rewards = data.rewards?.[kid] || [];
  const redeemed = data.redeemed[kid] || [];

  const handleRedeem = (reward) => {
    if (credits < reward.cost) return;
    const newData = { ...data };
    newData.credits = { ...data.credits, [kid]: credits - reward.cost };
    newData.redeemed = {
      ...data.redeemed,
      [kid]: [
        ...redeemed,
        { rewardId: reward.id, rewardName: reward.name, cost: reward.cost, date: new Date().toISOString() }
      ]
    };
    onSave(newData);
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="reward-store"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="store-header">
        <button className="icon-button back-button" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>

        <motion.h1
          className="store-title gradient-text"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          🛒 {KID_EMOJIS[kid]} {kid.toUpperCase()}'S STORE
        </motion.h1>

        <motion.div
          className="store-credits-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          ✨ {credits} Credits
        </motion.div>
      </div>

      <div className="store-content">

        {/* Rewards Grid */}
        {rewards.length === 0 ? (
          <div className="no-rewards glass-card">
            No rewards set up yet — ask an admin to add some! 🎁
          </div>
        ) : (
          <motion.div
            className="rewards-grid"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {rewards.map((reward) => {
              const canAfford = credits >= reward.cost;
              return (
                <motion.div
                  key={reward.id}
                  className={`reward-card glass-card ${!canAfford ? 'cannot-afford' : ''}`}
                  variants={cardVariants}
                  whileHover={canAfford ? { scale: 1.03, y: -4 } : {}}
                >
                  <div className="reward-icon">🎁</div>
                  <div className="reward-name">{reward.name}</div>
                  <div className={`reward-cost ${canAfford ? 'affordable' : 'too-expensive'}`}>
                    ✨ {reward.cost} Credits
                  </div>
                  <motion.button
                    className={`neon-button redeem-btn ${!canAfford ? 'redeem-disabled' : ''}`}
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford}
                    whileHover={canAfford ? { scale: 1.05 } : {}}
                    whileTap={canAfford ? { scale: 0.95 } : {}}
                  >
                    {canAfford ? '⚡ REDEEM' : 'NEED MORE ✨'}
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Redemption History */}
        {redeemed.length > 0 && (
          <motion.div
            className="redemption-history glass-card"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="history-title">📜 Redemption History</h2>
            <div className="history-list">
              {[...redeemed].reverse().map((item, i) => (
                <div key={i} className="history-item">
                  <FaCheck className="history-check" />
                  <span className="history-name">{item.rewardName}</span>
                  <span className="history-cost">−✨ {item.cost}</span>
                  <span className="history-date">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};

export default RewardStore;
