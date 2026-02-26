import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaSave, FaCheck } from 'react-icons/fa';
import CelebrationOverlay from './CelebrationOverlay';
import './KidQuest.css';

const KID_EMOJIS = { Jackson: '🐶', Natalie: '🐿️', Brooke: '🐱' };


const KidQuest = ({ kid, data, mode, isOverride, onSave, onBack }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [foodStep, setFoodStep] = useState(0);
  const [menuImage, setMenuImage] = useState(null);
  const [menuZoom, setMenuZoom] = useState(1);
  const [menuPan,  setMenuPan]  = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  const handleViewMenu = async () => {
    if (menuImage) { setMenuImage(menuImage); return; }
    const src = window.electronAPI ? await window.electronAPI.loadMenuImage() : null;
    setMenuImage(src || 'error');
  };

  const closeMenu = () => {
    setMenuImage(null);
    setMenuZoom(1);
    setMenuPan({ x: 0, y: 0 });
  };

  const handleMenuWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setMenuZoom(prev => Math.min(4, Math.max(0.5, prev + delta)));
  };

  const handleMenuMouseDown = (e) => {
    if (menuZoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = { x: e.clientX - menuPan.x, y: e.clientY - menuPan.y };
  };

  const handleMenuMouseMove = (e) => {
    if (!isDragging) return;
    setMenuPan({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y });
  };

  const handleMenuMouseUp = () => setIsDragging(false);

  const resetMenuZoom = () => { setMenuZoom(1); setMenuPan({ x: 0, y: 0 }); };
  const saved = data.choices[kid] || {};
  const toMap = arr => (arr || []).reduce((acc, item) => ({ ...acc, [item]: true }), {});

  const [selections, setSelections] = useState({
    breakfast:             toMap(saved.breakfast),
    special_breakfast:     toMap(saved.special_breakfast),
    lunch_main:            toMap(saved.lunch_main),
    lunch_sides_healthy:   toMap(saved.lunch_sides_healthy),
    lunch_sides_unhealthy: toMap(saved.lunch_sides_unhealthy),
    snacks:                toMap(saved.snacks),
    tasks:                 saved.checklist || {},
    school_lunch:          saved.school_lunch || false,
  });

  const taskList = data.tasks?.[mode]?.[kid] || [];
  const food = data.food || {};

  const toggleFood = (category, item, limit) => {
    setSelections(prev => {
      const current = prev[category] || {};
      if (current[item]) {
        return { ...prev, [category]: { ...current, [item]: false } };
      }
      if (Object.values(current).filter(v => v).length >= limit) return prev;
      return { ...prev, [category]: { ...current, [item]: true } };
    });
  };

  const handleTaskToggle = (task) => {
    setSelections(prev => ({
      ...prev,
      tasks: { ...prev.tasks, [task]: !prev.tasks[task] }
    }));
  };

  const handleSave = () => {
    const newData = { ...data };
    newData.choices = { ...data.choices };
    newData.last_date = { ...data.last_date };
    const today = new Date().toISOString().split('T')[0];

    newData.choices[kid] = {
      breakfast:             Object.keys(selections.breakfast).filter(k => selections.breakfast[k]),
      special_breakfast:     Object.keys(selections.special_breakfast).filter(k => selections.special_breakfast[k]),
      lunch_main:            Object.keys(selections.lunch_main).filter(k => selections.lunch_main[k]),
      lunch_sides_healthy:   Object.keys(selections.lunch_sides_healthy).filter(k => selections.lunch_sides_healthy[k]),
      lunch_sides_unhealthy: Object.keys(selections.lunch_sides_unhealthy).filter(k => selections.lunch_sides_unhealthy[k]),
      snacks:                Object.keys(selections.snacks).filter(k => selections.snacks[k]),
      checklist:             selections.tasks,
      school_lunch:          selections.school_lunch,
    };

    // Deep-copy completion_times so we don't mutate the original
    newData.completion_times = { ...data.completion_times };

    // Clear if the stored completion is from a previous day
    const prevCompletion = newData.completion_times[kid];
    if (prevCompletion && new Date(prevCompletion).toISOString().split('T')[0] !== today) {
      newData.completion_times[kid] = null;
    }

    newData.last_date[kid] = today;

    const allTasksComplete = taskList.length > 0 && taskList.every(task => selections.tasks[task]);

    let allFoodComplete = true;
    if (mode === 'morning') {
      const f = food;
      const sel = selections;
      const inStockCount = (arr) => (arr || []).filter(i => typeof i === 'string' || i.inStock).length;
      const foodChecks = [
        inStockCount(f.breakfast) === 0            || Object.values(sel.breakfast).some(v => v),
        inStockCount(f.special_breakfast) === 0    || Object.values(sel.special_breakfast).some(v => v),
        inStockCount(f.snacks) === 0               || Object.values(sel.snacks).some(v => v),
        sel.school_lunch || (
          (inStockCount(f.lunch_main) === 0            || Object.values(sel.lunch_main).some(v => v)) &&
          (inStockCount(f.lunch_sides_healthy) === 0   || Object.values(sel.lunch_sides_healthy).some(v => v)) &&
          (inStockCount(f.lunch_sides_unhealthy) === 0 || Object.values(sel.lunch_sides_unhealthy).some(v => v))
        ),
      ];
      allFoodComplete = foodChecks.every(Boolean);
    }

    const allComplete = allTasksComplete && allFoodComplete;

    if (allComplete && (isOverride || !newData.completion_times[kid])) {
      if (isOverride) {
        // Test mode — celebrate but don't record anything permanent
        onSave(newData);
        setShowCelebration(true);
        return;
      }

      const now = Date.now();
      newData.completion_times[kid] = now;

      // Log this completion for stats
      if (!newData.completion_log) newData.completion_log = {};
      if (!newData.completion_log[kid]) newData.completion_log[kid] = [];
      newData.completion_log[kid] = [
        ...newData.completion_log[kid],
        { date: today, time: now, mode },
      ];

      onSave(newData);
      setShowCelebration(true);
      return;
    }

    onSave(newData);
    onBack();
  };

  const completedCount = taskList.filter(t => selections.tasks[t]).length;

  return (
    <>
    <AnimatePresence>
      {showCelebration && (
        <CelebrationOverlay key="celebration" kid={kid} onDone={onBack} />
      )}
    </AnimatePresence>

    {/* School Menu Modal */}
    <AnimatePresence>
      {menuImage && (
        <motion.div
          className="menu-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMenu}
        >
          <motion.div
            className="menu-modal-content"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {menuImage === 'error' ? (
              <p className="menu-error">Could not load lunch_menu.jpg — make sure it's in the app folder.</p>
            ) : (
              <>
                <div className="menu-zoom-controls">
                  <button className="menu-zoom-btn" onClick={() => setMenuZoom(z => Math.max(0.5, z - 0.25))}>−</button>
                  <span className="menu-zoom-label">{Math.round(menuZoom * 100)}%</span>
                  <button className="menu-zoom-btn" onClick={() => setMenuZoom(z => Math.min(4, z + 0.25))}>+</button>
                  <button className="menu-zoom-btn menu-zoom-reset" onClick={resetMenuZoom}>↺</button>
                </div>
                <div
                  className="menu-viewport"
                  onWheel={handleMenuWheel}
                  onMouseDown={handleMenuMouseDown}
                  onMouseMove={handleMenuMouseMove}
                  onMouseUp={handleMenuMouseUp}
                  onMouseLeave={handleMenuMouseUp}
                  onDoubleClick={resetMenuZoom}
                  style={{ cursor: menuZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
                >
                  <img
                    src={menuImage}
                    alt="School Lunch Menu"
                    className="menu-image"
                    draggable={false}
                    style={{
                      transform: `scale(${menuZoom}) translate(${menuPan.x / menuZoom}px, ${menuPan.y / menuZoom}px)`,
                      transformOrigin: 'center center',
                    }}
                  />
                </div>
              </>
            )}
            <button className="neon-button menu-close-btn" onClick={closeMenu}>
              ✕ CLOSE
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <motion.div
      className="kid-quest"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Header */}
      <div className="quest-header">
        <button className="icon-button back-button" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
        <motion.h1
          className="quest-title gradient-text"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          MISSION: {KID_EMOJIS[kid]} {kid.toUpperCase()} 🚀
        </motion.h1>
        <div style={{ width: '100px' }}></div>
      </div>

      {/* Main Content */}
      <div className="quest-content">

        {/* Task Checklist */}
        <motion.div
          className="quest-section glass-card"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="section-title">{mode.toUpperCase()} TASKS 📋</h2>

          {taskList.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1rem' }}>
              No tasks found — check the Excel file.
            </p>
          ) : (
            <div className="task-grid">
              {taskList.map((task, index) => (
                <motion.div
                  key={task}
                  className={`task-item ${selections.tasks[task] ? 'completed' : ''}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTaskToggle(task)}
                >
                  <div className="task-checkbox">
                    {selections.tasks[task] && <FaCheck />}
                  </div>
                  <span className="task-text">{task}</span>
                </motion.div>
              ))}
            </div>
          )}

          {taskList.length > 0 && (
            <div className="task-progress">
              <span>{completedCount} / {taskList.length} Complete</span>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / taskList.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Food Wizard — morning (required), afternoon & weekend (optional, carries over to Mon) */}
        {(mode === 'morning' || mode === 'afternoon' || mode === 'weekend') && (() => {
          const steps = [
            { key: 'breakfast',             label: '🍳 Breakfast',          limit: 3 },
            { key: 'special_breakfast',     label: '⭐ Special Breakfast',   limit: 1 },
            { key: 'snacks',                label: '🍎 Snacks',              limit: 2 },
            { key: 'school_lunch',          label: '🏫 Lunch Plan',          limit: null },
            ...(!selections.school_lunch ? [
              { key: 'lunch_main',            label: '🥪 Lunch Main',         limit: 1 },
              { key: 'lunch_sides_healthy',   label: '🥦 Healthy Sides',      limit: 3 },
              { key: 'lunch_sides_unhealthy', label: '🍟 Treat Side',          limit: 1 },
            ] : []),
          ].filter(s => s.key === 'school_lunch' || (food[s.key] || []).filter(i => typeof i === 'string' || i.inStock).length > 0);

          const step = foodStep >= steps.length ? steps.length - 1 : foodStep;
          const current = steps[step];
          const isFirst = step === 0;
          const isLast  = step === steps.length - 1;
          const picked  = current?.limit
            ? Object.values(selections[current.key] || {}).filter(v => v).length
            : null;

          return (
            <motion.div
              className="quest-section glass-card food-wizard"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="food-wizard-header">
                <div>
                  <h2 className="section-title">FUEL SELECTION 🍳</h2>
                  {mode === 'afternoon' && (
                    <p className="food-optional-note">Optional · carries over to tomorrow's morning quest</p>
                  )}
                  {mode === 'weekend' && (
                    <p className="food-optional-note">Optional · pre-loads Monday morning fuel</p>
                  )}
                </div>
                <div className="food-step-dots">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.key}
                  className="food-step-body"
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0,  opacity: 1 }}
                  exit={{ x: -60,   opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="food-step-label">
                    <h3>{current.label}</h3>
                    {current.limit && (
                      <span className="food-limit">pick up to {current.limit}</span>
                    )}
                    {picked !== null && (
                      <span className="food-picked">{picked} / {current.limit}</span>
                    )}
                  </div>

                  {current.key === 'school_lunch' ? (
                    <div>
                      <div className="school-lunch-options">
                        <button
                          className={`food-option school-lunch-btn ${!selections.school_lunch ? 'selected' : ''}`}
                          onClick={() => setSelections(prev => ({ ...prev, school_lunch: false }))}
                        >
                          🎒 Packing Lunch
                        </button>
                        <button
                          className={`food-option school-lunch-btn ${selections.school_lunch ? 'selected' : ''}`}
                          onClick={() => setSelections(prev => ({ ...prev, school_lunch: true }))}
                        >
                          🏫 Buying School Lunch
                        </button>
                      </div>
                      <button className="neon-button view-menu-btn" onClick={handleViewMenu}>
                        📋 View School Menu
                      </button>
                    </div>
                  ) : (
                    <div className="food-options">
                      {(food[current.key] || [])
                        .filter(i => typeof i === 'string' || i.inStock)
                        .map(i => typeof i === 'string' ? i : i.name)
                        .map(item => (
                        <button
                          key={item}
                          className={`food-option ${selections[current.key]?.[item] ? 'selected' : ''}`}
                          onClick={() => toggleFood(current.key, item, current.limit)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="food-nav">
                <button
                  className="neon-button food-nav-btn"
                  onClick={() => setFoodStep(s => Math.max(0, s - 1))}
                  style={{ visibility: isFirst ? 'hidden' : 'visible' }}
                >
                  ← BACK
                </button>
                <span className="food-step-counter">{step + 1} of {steps.length}</span>
                <button
                  className="neon-button food-nav-btn"
                  onClick={() => setFoodStep(s => Math.min(steps.length - 1, s + 1))}
                  style={{ visibility: isLast ? 'hidden' : 'visible' }}
                >
                  NEXT →
                </button>
              </div>
            </motion.div>
          );
        })()}

      </div>

      {/* Save Button */}
      <motion.button
        className="neon-button save-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSave}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <FaSave /> SAVE QUEST
      </motion.button>
    </motion.div>
    </>
  );
};

export default KidQuest;
