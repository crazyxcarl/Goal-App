import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTrash, FaPlus, FaTimes, FaSync, FaKey } from 'react-icons/fa';
import './AdminPanel.css';

const toTimeString = (hour, min) =>
  `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

const FOOD_CATEGORIES = [
  { key: 'breakfast',             label: '🍳 Breakfast' },
  { key: 'special_breakfast',     label: '⭐ Special Breakfast' },
  { key: 'snacks',                label: '🍎 Snacks' },
  { key: 'lunch_main',            label: '🥪 Lunch Main' },
  { key: 'lunch_sides_healthy',   label: '🥦 Healthy Sides' },
  { key: 'lunch_sides_unhealthy', label: '🍟 Treat Side' },
];

const AdminPanel = ({ data, onSave, onReload, onBack, modeOverride, onModeOverride }) => {
  const [credits, setCredits] = useState({});

  // Tasks & Food editor state
  const [editorTab,    setEditorTab]    = useState('tasks');
  const [taskMode,     setTaskMode]     = useState('morning');
  const [foodCategory, setFoodCategory] = useState('breakfast');
  const [localTasks,   setLocalTasks]   = useState(() => JSON.parse(JSON.stringify(data.tasks || {})));
  const [localFood,    setLocalFood]    = useState(() => JSON.parse(JSON.stringify(data.food  || {})));
  const [taskInputs,   setTaskInputs]   = useState({});
  const [foodInput,    setFoodInput]    = useState('');
  const [saving,       setSaving]       = useState(false);

  // Change Password state
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [pwMessage,  setPwMessage]  = useState(null); // { type: 'error'|'success', text }


  // Goals editor state (weekend)
  const [localGoals,      setLocalGoals]      = useState(() => JSON.parse(JSON.stringify(data.goals   || {})));
  const [goalInputs,      setGoalInputs]      = useState({});
  const [goalCreditInputs, setGoalCreditInputs] = useState({});
  const [weekendSubTab,   setWeekendSubTab]   = useState('tasks'); // 'tasks' | 'goals'

  // Rewards editor state
  const [localRewards,    setLocalRewards]    = useState(() => JSON.parse(JSON.stringify(data.rewards || {})));
  const [rewardNameInputs, setRewardNameInputs] = useState({});
  const [rewardCostInputs, setRewardCostInputs] = useState({});

  useEffect(() => { setLocalTasks(JSON.parse(JSON.stringify(data.tasks    || {}))); }, [data.tasks]);
  useEffect(() => { setLocalFood(JSON.parse(JSON.stringify(data.food      || {}))); }, [data.food]);
  useEffect(() => { setLocalGoals(JSON.parse(JSON.stringify(data.goals    || {}))); }, [data.goals]);
  useEffect(() => { setLocalRewards(JSON.parse(JSON.stringify(data.rewards || {}))); }, [data.rewards]);

  const writeTasksToExcel = async (tasks) => {
    if (!window.electronAPI) return;
    setSaving(true);
    await window.electronAPI.writeExcelTasks({ tasks, goals: localGoals });
    if (onReload) await onReload();
    setSaving(false);
  };

  const writeGoalsToExcel = async (goals) => {
    if (!window.electronAPI) return;
    setSaving(true);
    await window.electronAPI.writeExcelTasks({ tasks: localTasks, goals });
    if (onReload) await onReload();
    setSaving(false);
  };

  const writeFoodToExcel = async (food) => {
    if (!window.electronAPI) return;
    setSaving(true);
    await window.electronAPI.writeExcelFood(food);
    if (onReload) await onReload();
    setSaving(false);
  };

  const writeRewardsToExcel = async (rewards) => {
    if (!window.electronAPI) return;
    setSaving(true);
    await window.electronAPI.writeExcelRewards(rewards);
    if (onReload) await onReload();
    setSaving(false);
  };

  const addReward = async (kid) => {
    const name = (rewardNameInputs[kid] || '').trim();
    const cost = parseInt(rewardCostInputs[kid]) || 0;
    if (!name || cost <= 0) return;
    const updated = JSON.parse(JSON.stringify(localRewards));
    if (!updated[kid]) updated[kid] = [];
    updated[kid] = [...updated[kid], { id: `${kid}-${Date.now()}`, name, cost }];
    setLocalRewards(updated);
    setRewardNameInputs(prev => ({ ...prev, [kid]: '' }));
    setRewardCostInputs(prev => ({ ...prev, [kid]: '' }));
    await writeRewardsToExcel(updated);
  };

  const removeReward = async (kid, id) => {
    const updated = JSON.parse(JSON.stringify(localRewards));
    updated[kid] = (updated[kid] || []).filter(r => r.id !== id);
    setLocalRewards(updated);
    await writeRewardsToExcel(updated);
  };

  const addTask = async (kid) => {
    const text = (taskInputs[`${taskMode}-${kid}`] || '').trim();
    if (!text) return;
    const updated = JSON.parse(JSON.stringify(localTasks));
    if (!updated[taskMode])       updated[taskMode]       = {};
    if (!updated[taskMode][kid])  updated[taskMode][kid]  = [];
    updated[taskMode][kid] = [...updated[taskMode][kid], text];
    setLocalTasks(updated);
    setTaskInputs(prev => ({ ...prev, [`${taskMode}-${kid}`]: '' }));
    await writeTasksToExcel(updated);
  };

  const removeTask = async (kid, taskText) => {
    const updated = JSON.parse(JSON.stringify(localTasks));
    updated[taskMode][kid] = (updated[taskMode][kid] || []).filter(t => t !== taskText);
    setLocalTasks(updated);
    await writeTasksToExcel(updated);
  };

  const addGoal = async (kid) => {
    const text = (goalInputs[kid] || '').trim();
    const credits = parseInt(goalCreditInputs[kid]) || 1;
    if (!text) return;
    const updated = JSON.parse(JSON.stringify(localGoals));
    if (!updated[kid]) updated[kid] = [];
    updated[kid] = [...updated[kid], { name: text, credits }];
    setLocalGoals(updated);
    setGoalInputs(prev => ({ ...prev, [kid]: '' }));
    setGoalCreditInputs(prev => ({ ...prev, [kid]: '' }));
    await writeGoalsToExcel(updated);
  };

  const removeGoal = async (kid, goalName) => {
    const updated = JSON.parse(JSON.stringify(localGoals));
    updated[kid] = (updated[kid] || []).filter(g =>
      (typeof g === 'string' ? g : g.name) !== goalName
    );
    setLocalGoals(updated);
    await writeGoalsToExcel(updated);
  };

  const addFoodItem = async () => {
    const text = foodInput.trim();
    if (!text) return;
    const updated = JSON.parse(JSON.stringify(localFood));
    if (!updated[foodCategory]) updated[foodCategory] = [];
    updated[foodCategory] = [...updated[foodCategory], text];
    setLocalFood(updated);
    setFoodInput('');
    await writeFoodToExcel(updated);
  };

  const removeFoodItem = async (item) => {
    const updated = JSON.parse(JSON.stringify(localFood));
    updated[foodCategory] = (updated[foodCategory] || []).filter(i => i !== item);
    setLocalFood(updated);
    await writeFoodToExcel(updated);
  };

  const handleReloadFromExcel = async () => {
    if (onReload) await onReload();
  };

  const handleChangePassword = () => {
    const current = data.config?.password || '1234';
    if (currentPw !== current) {
      setPwMessage({ type: 'error', text: 'Current password is incorrect' });
      return;
    }
    if (!newPw) {
      setPwMessage({ type: 'error', text: 'New password cannot be empty' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    const newData = { ...data, config: { ...data.config, password: newPw } };
    onSave(newData);
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setPwMessage({ type: 'success', text: 'Password updated!' });
  };

  const afternoonTime = toTimeString(data.config.am_hour, data.config.am_min);
  const morningTime   = toTimeString(data.config.pm_hour, data.config.pm_min);

  const handleCreditChange = (kid, delta) => {
    const newData = { ...data };
    newData.credits[kid] = Math.max(0, (newData.credits[kid] || 0) + delta);
    onSave(newData);
  };

  const handleTimeChange = (field, value) => {
    const [h, m] = value.split(':').map(Number);
    const newData = { ...data, config: { ...data.config } };
    if (field === 'afternoon') {
      newData.config.am_hour = h;
      newData.config.am_min = m;
    } else {
      newData.config.pm_hour = h;
      newData.config.pm_min = m;
    }
    onSave(newData);
  };

  const handleMasterReset = () => {
    if (window.confirm('⚠️ This will WIPE all Credits, Trophies, Goals, and Selections for ALL kids. Proceed?')) {
      const newData = { ...data };
      data.kids.forEach(kid => {
        newData.credits[kid] = 0;
        newData.trophy_counts[kid] = { "1": 0, "2": 0, "3": 0 };
        newData.goal_log[kid] = [];
        newData.choices[kid] = {};
        newData.completion_times[kid] = null;
      });
      onSave(newData);
    }
  };

  return (
    <motion.div
      className="admin-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="admin-header">
        <button className="icon-button back-button" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
        
        <motion.h1
          className="admin-title"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          🛠️ ADMIN CONTROL PANEL
        </motion.h1>
        
        <div style={{ width: '100px' }}></div>
      </div>

      <div className="admin-content">
        <div className="admin-grid">
          {data.kids.map((kid, index) => (
            <motion.div
              key={kid}
              className="admin-card glass-card"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="admin-kid-name gradient-text">{kid.toUpperCase()}</h2>
              
              {/* Credits */}
              <div className="admin-section">
                <h3>Credits</h3>
                <div className="admin-control">
                  <button 
                    className="control-btn minus"
                    onClick={() => handleCreditChange(kid, -1)}
                  >
                    −
                  </button>
                  <span className="control-value">{data.credits[kid] || 0}</span>
                  <button 
                    className="control-btn plus"
                    onClick={() => handleCreditChange(kid, 1)}
                  >
                    +
                  </button>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Quest Override */}
        <motion.div
          className="settings-zone glass-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2>🎮 QUEST OVERRIDE</h2>
          <div className="override-buttons">
            {[
              { label: '🌅 Morning',   value: 'morning'   },
              { label: '☀️ Afternoon', value: 'afternoon' },
              { label: '🎮 Weekend',   value: 'weekend'   },
              { label: '⛔ Off',       value: null         },
            ].map(({ label, value }) => (
              <button
                key={label}
                className={`override-btn ${modeOverride === value ? 'active' : ''} ${value === null ? 'override-off' : ''}`}
                onClick={() => onModeOverride(value)}
              >
                {label}
              </button>
            ))}
          </div>
          {modeOverride && (
            <p className="override-active-msg">⚠️ Override active — dashboard is locked to <strong>{modeOverride}</strong> mode</p>
          )}
        </motion.div>

        {/* Quest Timing */}
        <motion.div
          className="settings-zone glass-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h2>⏰ QUEST TIMING</h2>
          <div className="time-settings">
            <div className="time-setting-item">
              <div className="time-setting-label">
                <span className="time-icon">☀️</span>
                <div>
                  <div className="time-setting-title">Afternoon Quest Starts</div>
                  <div className="time-setting-desc">Morning tasks end, afternoon begins</div>
                </div>
              </div>
              <input
                type="time"
                className="time-input"
                value={afternoonTime}
                onChange={e => handleTimeChange('afternoon', e.target.value)}
              />
            </div>
            <div className="time-setting-item">
              <div className="time-setting-label">
                <span className="time-icon">🌙</span>
                <div>
                  <div className="time-setting-title">Morning Quest Starts</div>
                  <div className="time-setting-desc">Afternoon ends, next morning begins</div>
                </div>
              </div>
              <input
                type="time"
                className="time-input"
                value={morningTime}
                onChange={e => handleTimeChange('morning', e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* Reward Store Editor */}
        <motion.div
          className="settings-zone glass-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>🛒 REWARD STORE</h2>

          <div className="task-editor-grid">
            {data.kids.map(kid => (
              <div key={kid} className="task-editor-col">
                <h4 className="task-editor-kid">{kid}</h4>

                <div className="task-editor-list">
                  {(localRewards[kid] || []).length === 0 && (
                    <p className="editor-empty">No rewards</p>
                  )}
                  {(localRewards[kid] || []).map(reward => (
                    <div key={reward.id} className="task-editor-item reward-editor-item">
                      <span className="reward-editor-name">{reward.name}</span>
                      <span className="reward-editor-cost">✨ {reward.cost}</span>
                      <button
                        className="editor-remove-btn"
                        onClick={() => removeReward(kid, reward.id)}
                        disabled={saving}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="reward-add-row">
                  <input
                    className="editor-input"
                    placeholder="Reward name…"
                    value={rewardNameInputs[kid] || ''}
                    onChange={e => setRewardNameInputs(prev => ({ ...prev, [kid]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addReward(kid)}
                    disabled={saving}
                  />
                  <input
                    className="editor-input reward-cost-field"
                    type="number"
                    min="1"
                    placeholder="✨"
                    value={rewardCostInputs[kid] || ''}
                    onChange={e => setRewardCostInputs(prev => ({ ...prev, [kid]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addReward(kid)}
                    disabled={saving}
                  />
                  <button
                    className="editor-add-btn"
                    onClick={() => addReward(kid)}
                    disabled={saving}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Goals Editor */}
        <motion.div
          className="settings-zone glass-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.42 }}
        >
          <h2>🎯 GOALS EDITOR</h2>

          <div className="task-editor-grid">
            {data.kids.map(kid => (
              <div key={kid} className="task-editor-col">
                <h4 className="task-editor-kid">{kid}</h4>

                <div className="task-editor-list">
                  {(localGoals[kid] || []).length === 0 && (
                    <p className="editor-empty">No goals</p>
                  )}
                  {(localGoals[kid] || []).map(goal => {
                    const gName = typeof goal === 'string' ? goal : goal.name;
                    const gCredits = typeof goal === 'string' ? null : goal.credits;
                    return (
                      <div key={gName} className="task-editor-item reward-editor-item">
                        <span className="reward-editor-name">{gName}</span>
                        {gCredits !== null && <span className="reward-editor-cost">✨ {gCredits}</span>}
                        <button
                          className="editor-remove-btn"
                          onClick={() => removeGoal(kid, gName)}
                          disabled={saving}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="reward-add-row">
                  <input
                    className="editor-input"
                    placeholder="New goal…"
                    value={goalInputs[kid] || ''}
                    onChange={e => setGoalInputs(prev => ({ ...prev, [kid]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addGoal(kid)}
                    disabled={saving}
                  />
                  <input
                    className="editor-input reward-cost-field"
                    type="number"
                    min="1"
                    placeholder="✨"
                    value={goalCreditInputs[kid] || ''}
                    onChange={e => setGoalCreditInputs(prev => ({ ...prev, [kid]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addGoal(kid)}
                    disabled={saving}
                  />
                  <button
                    className="editor-add-btn"
                    onClick={() => addGoal(kid)}
                    disabled={saving}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tasks & Food Editor */}
        <motion.div
          className="settings-zone glass-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <div className="editor-header">
            <h2>📝 TASKS &amp; FOOD EDITOR</h2>
            <button className="editor-reload-btn" onClick={handleReloadFromExcel} disabled={saving}>
              <FaSync /> {saving ? 'Saving…' : 'Reload from Excel'}
            </button>
          </div>

          {/* Editor tab toggle */}
          <div className="editor-tabs">
            {['tasks', 'food'].map(tab => (
              <button
                key={tab}
                className={`override-btn ${editorTab === tab ? 'active' : ''}`}
                onClick={() => setEditorTab(tab)}
              >
                {tab === 'tasks' ? '📋 Tasks' : '🍳 Food'}
              </button>
            ))}
          </div>

          {/* ── TASKS EDITOR ── */}
          {editorTab === 'tasks' && (
            <>
              <div className="editor-mode-tabs">
                {['morning', 'afternoon', 'weekend'].map(m => (
                  <button
                    key={m}
                    className={`editor-mode-btn ${taskMode === m ? 'active' : ''}`}
                    onClick={() => setTaskMode(m)}
                  >
                    {m === 'morning' ? '🌅 Morning' : m === 'afternoon' ? '☀️ Afternoon' : '🎮 Weekend'}
                  </button>
                ))}
              </div>

              {/* Weekend sub-tabs: Tasks vs Goals */}
              {taskMode === 'weekend' && (
                <div className="editor-mode-tabs">
                  {[
                    { value: 'tasks', label: '📋 Tasks' },
                    { value: 'goals', label: '🎯 Goals' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      className={`editor-mode-btn ${weekendSubTab === value ? 'active' : ''}`}
                      onClick={() => setWeekendSubTab(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Tasks grid */}
              {(taskMode !== 'weekend' || weekendSubTab === 'tasks') && (
                <div className="task-editor-grid">
                  {data.kids.map(kid => (
                    <div key={kid} className="task-editor-col">
                      <h4 className="task-editor-kid">{kid}</h4>
                      <div className="task-editor-list">
                        {(localTasks[taskMode]?.[kid] || []).length === 0 && (
                          <p className="editor-empty">No tasks</p>
                        )}
                        {(localTasks[taskMode]?.[kid] || []).map(task => (
                          <div key={task} className="task-editor-item">
                            <span>{task}</span>
                            <button
                              className="editor-remove-btn"
                              onClick={() => removeTask(kid, task)}
                              disabled={saving}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="editor-add-row">
                        <input
                          className="editor-input"
                          placeholder="New task…"
                          value={taskInputs[`${taskMode}-${kid}`] || ''}
                          onChange={e => setTaskInputs(prev => ({
                            ...prev, [`${taskMode}-${kid}`]: e.target.value
                          }))}
                          onKeyDown={e => e.key === 'Enter' && addTask(kid)}
                          disabled={saving}
                        />
                        <button
                          className="editor-add-btn"
                          onClick={() => addTask(kid)}
                          disabled={saving}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Goals grid (weekend only) */}
              {taskMode === 'weekend' && weekendSubTab === 'goals' && (
                <div className="task-editor-grid">
                  {data.kids.map(kid => (
                    <div key={kid} className="task-editor-col">
                      <h4 className="task-editor-kid">{kid}</h4>
                      <div className="task-editor-list">
                        {(localGoals[kid] || []).length === 0 && (
                          <p className="editor-empty">No goals</p>
                        )}
                        {(localGoals[kid] || []).map(goal => {
                          const gName = typeof goal === 'string' ? goal : goal.name;
                          const gCredits = typeof goal === 'string' ? null : goal.credits;
                          return (
                            <div key={gName} className="task-editor-item reward-editor-item">
                              <span className="reward-editor-name">{gName}</span>
                              {gCredits !== null && <span className="reward-editor-cost">✨ {gCredits}</span>}
                              <button
                                className="editor-remove-btn"
                                onClick={() => removeGoal(kid, gName)}
                                disabled={saving}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="reward-add-row">
                        <input
                          className="editor-input"
                          placeholder="New goal…"
                          value={goalInputs[kid] || ''}
                          onChange={e => setGoalInputs(prev => ({ ...prev, [kid]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addGoal(kid)}
                          disabled={saving}
                        />
                        <input
                          className="editor-input reward-cost-field"
                          type="number"
                          min="1"
                          placeholder="✨"
                          value={goalCreditInputs[kid] || ''}
                          onChange={e => setGoalCreditInputs(prev => ({ ...prev, [kid]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addGoal(kid)}
                          disabled={saving}
                        />
                        <button
                          className="editor-add-btn"
                          onClick={() => addGoal(kid)}
                          disabled={saving}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── FOOD EDITOR ── */}
          {editorTab === 'food' && (
            <>
              <div className="food-cat-tabs">
                {FOOD_CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    className={`editor-mode-btn ${foodCategory === cat.key ? 'active' : ''}`}
                    onClick={() => setFoodCategory(cat.key)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="food-editor-list">
                {(localFood[foodCategory] || []).length === 0 && (
                  <p className="editor-empty">No items</p>
                )}
                {(localFood[foodCategory] || []).map(item => (
                  <div key={item} className="task-editor-item">
                    <span>{item}</span>
                    <button
                      className="editor-remove-btn"
                      onClick={() => removeFoodItem(item)}
                      disabled={saving}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>

              <div className="editor-add-row">
                <input
                  className="editor-input"
                  placeholder="New item…"
                  value={foodInput}
                  onChange={e => setFoodInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addFoodItem()}
                  disabled={saving}
                />
                <button className="editor-add-btn" onClick={addFoodItem} disabled={saving}>
                  <FaPlus />
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* Change Password */}
        <motion.div
          className="settings-zone glass-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.47 }}
        >
          <h2><FaKey /> CHANGE PASSWORD</h2>
          <div className="password-change-form">
            <input
              className="editor-input"
              type="password"
              placeholder="Current password"
              value={currentPw}
              onChange={e => { setCurrentPw(e.target.value); setPwMessage(null); }}
            />
            <input
              className="editor-input"
              type="password"
              placeholder="New password"
              value={newPw}
              onChange={e => { setNewPw(e.target.value); setPwMessage(null); }}
            />
            <input
              className="editor-input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setPwMessage(null); }}
              onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
            />
            {pwMessage && (
              <p className={`pw-message ${pwMessage.type}`}>{pwMessage.text}</p>
            )}
            <button className="neon-button" onClick={handleChangePassword}>
              Save Password
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          className="danger-zone glass-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>⚠️ DANGER ZONE</h2>
          <p>This action cannot be undone!</p>
          <button 
            className="neon-button danger-button"
            onClick={handleMasterReset}
          >
            <FaTrash /> MASTER RESET
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
