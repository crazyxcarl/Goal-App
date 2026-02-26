import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import Dashboard from './components/Dashboard';
import KidQuest from './components/KidQuest';
import StatsRoom from './components/StatsRoom';
import GoalRoom from './components/GoalRoom';
import AdminPanel from './components/AdminPanel';
import RewardStore from './components/RewardStore';
import KidSelections from './components/KidSelections';

function App() {
  const [data, setData] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedKid, setSelectedKid] = useState(null);
  const [mode, setMode] = useState('morning');
  const [modeOverride, setModeOverride] = useState(null);
  const prevModeRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!data) return;
    updateMode();
    const interval = setInterval(updateMode, 10000);
    return () => clearInterval(interval);
  }, [data]);

  const loadData = async () => {
    if (window.electronAPI) {
      const loadedData = await window.electronAPI.loadData();
      setData(loadedData);
    } else {
      // Fallback for web browser testing
      const defaultData = {
        kids: ["Jackson", "Natalie", "Brooke"],
        last_date: {},
        choices: {},
        completion_times: {},
        trophy_counts: {
          Jackson: { "1": 0, "2": 0, "3": 0 },
          Natalie: { "1": 0, "2": 0, "3": 0 },
          Brooke: { "1": 0, "2": 0, "3": 0 }
        },
        credits: { Jackson: 5, Natalie: 3, Brooke: 8 },
        redeemed: { Jackson: [], Natalie: [], Brooke: [] },
        rewards: [
          { id: '1', name: 'Extra Screen Time', cost: 5 },
          { id: '2', name: 'Pick Dinner', cost: 3 },
          { id: '3', name: 'Stay Up Late', cost: 8 },
          { id: '4', name: 'Skip a Chore', cost: 4 },
          { id: '5', name: 'Movie Night Pick', cost: 6 },
        ],
        goal_log: { Jackson: [], Natalie: [], Brooke: [] },
        config: { am_hour: 7, am_min: 20, pm_hour: 19, pm_min: 0 }
      };
      setData(defaultData);
    }
  };

  const saveData = async (newData) => {
    setData(newData);
    if (window.electronAPI) {
      await window.electronAPI.saveData(newData);
    }
  };

  const updateMode = () => {
    if (!data) return;

    const now = new Date();
    const config = data.config;
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const isPostPM = hour > config.pm_hour || (hour === config.pm_hour && minute >= config.pm_min);
    const isPreAM = hour < config.am_hour || (hour === config.am_hour && minute < config.am_min);

    const isWeekend = (dayOfWeek === 5 && isPostPM) || dayOfWeek === 6 || (dayOfWeek === 0 && !isPostPM);

    let newMode;
    if (isWeekend) {
      newMode = 'weekend';
    } else {
      const isMorning = ([0, 1, 2, 3, 4].includes(dayOfWeek) && isPostPM) ||
                        ([1, 2, 3, 4, 5].includes(dayOfWeek) && isPreAM);
      newMode = isMorning ? 'morning' : 'afternoon';
    }

    // Clear food selections when transitioning into afternoon
    if (prevModeRef.current !== null && prevModeRef.current !== 'afternoon' && newMode === 'afternoon') {
      const updated = { ...data, choices: { ...data.choices } };
      data.kids.forEach(kid => {
        if (updated.choices[kid]) {
          updated.choices[kid] = {
            ...updated.choices[kid],
            breakfast: [],
            special_breakfast: [],
            snacks: [],
            lunch_main: [],
            lunch_sides_healthy: [],
            lunch_sides_unhealthy: [],
            school_lunch: false,
          };
        }
      });
      saveData(updated);
    }

    prevModeRef.current = newMode;
    setMode(newMode);
  };

  const openKidQuest = (kid) => {
    setSelectedKid(kid);
    setCurrentView('quest');
  };

  const openStore = (kid) => {
    setSelectedKid(kid);
    setCurrentView('store');
  };

  const openSelections = (kid) => {
    setSelectedKid(kid);
    setCurrentView('selections');
  };

  if (!data) {
    return (
      <div className="loading-screen">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          🚀
        </motion.div>
        <h2>Loading Adventure Hub...</h2>
      </div>
    );
  }

  const effectiveMode = modeOverride || mode;

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' && (
          <Dashboard
            key="dashboard"
            data={data}
            mode={effectiveMode}
            onKidSelect={openKidQuest}
            onStoreSelect={openStore}
            onSelectionsSelect={openSelections}
            onTrophyRoom={() => setCurrentView('trophy')}
            onGoalRoom={() => setCurrentView('goals')}
            onAdminPanel={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'quest' && (
          <KidQuest
            key="quest"
            kid={selectedKid}
            data={data}
            mode={effectiveMode}
            isOverride={!!modeOverride}
            onSave={saveData}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'trophy' && (
          <StatsRoom
            key="trophy"
            data={data}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'goals' && (
          <GoalRoom
            key="goals"
            data={data}
            onSave={saveData}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'store' && (
          <RewardStore
            key="store"
            kid={selectedKid}
            data={data}
            onSave={saveData}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'selections' && (
          <KidSelections
            key="selections"
            kid={selectedKid}
            data={data}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            key="admin"
            data={data}
            onSave={saveData}
            onReload={loadData}
            modeOverride={modeOverride}
            onModeOverride={setModeOverride}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
