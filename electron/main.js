const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const xlsx = require('xlsx');
const isDev = !app.isPackaged;

let mainWindow;

const SAVE_FILE = path.join(app.getPath('userData'), 'morning_routine_kids.json');
const EXCEL_FILE = path.join(app.getAppPath(), 'goal_app_data.xlsx');

const KIDS = ['Jackson', 'Natalie', 'Brooke'];

function parseExcelData(filePath) {
  try {
    const wb = xlsx.readFile(filePath);
    const result = {
      tasks: { morning: {}, afternoon: {}, weekend: {} },
      food: {},
      rewards: {},
      goals: {},
    };

    // ── Tasks & Goals ──────────────────────────────────────────────────────────
    const modeSheets = {
      morning: 'morning_tasks',
      afternoon: 'afternoon_tasks',
      weekend: 'weekend_tasks',
    };

    Object.entries(modeSheets).forEach(([mode, sheetName]) => {
      if (!wb.SheetNames.includes(sheetName)) return;
      const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
      const header = rows[0] || [];

      KIDS.forEach(kid => {
        // Task column: contains kid name but NOT "Goal"
        const taskCol = header.findIndex(h =>
          h && h.toString().includes(kid) && !h.toString().includes('Goal')
        );
        if (taskCol !== -1) {
          result.tasks[mode][kid] = rows.slice(1)
            .map(r => (r[taskCol] || '').toString().trim())
            .filter(v => v !== '');
        }

        // Goal column (weekend sheet only): header is exactly "<Kid> Goal"
        if (mode === 'weekend') {
          const goalCol = header.findIndex(h =>
            h && h.toString().trim() === `${kid} Goal`
          );
          const creditCol = header.findIndex(h =>
            h && h.toString().trim() === `${kid} Goal Credits`
          );
          if (goalCol !== -1) {
            result.goals[kid] = rows.slice(1)
              .map(r => {
                const name = (r[goalCol] || '').toString().trim();
                if (!name) return null;
                const credits = creditCol !== -1 ? parseInt(r[creditCol]) : NaN;
                return !isNaN(credits) ? { name, credits } : name;
              })
              .filter(v => v !== null);
          }
        }
      });
    });

    // ── Food Options ───────────────────────────────────────────────────────────
    if (wb.SheetNames.includes('morning_options')) {
      const rows = xlsx.utils.sheet_to_json(wb.Sheets['morning_options'], { header: 1, defval: '' });
      const header = rows[0] || [];

      const categories = [
        { key: 'breakfast',            name: 'Breakfast' },
        { key: 'special_breakfast',    name: 'Special Breakfast' },
        { key: 'lunch_main',           name: 'Lunch Main' },
        { key: 'lunch_sides_healthy',  name: 'Lunch Sides Healthy' },
        { key: 'lunch_sides_unhealthy',name: 'Lunch Sides Unhealthy' },
        { key: 'snacks',               name: 'Snacks' },
      ];

      categories.forEach(({ key, name }) => {
        const nameCol = header.findIndex(h => (h || '').toString().trim() === name);
        if (nameCol === -1) return;
        const invCol = nameCol + 1;
        result.food[key] = rows.slice(1)
          .filter(r => (r[nameCol] || '').toString().trim() !== '')
          .map(r => ({
            name: r[nameCol].toString().trim(),
            inStock: (r[invCol] || '').toString().toLowerCase() === 'yes',
          }));
      });
    }

    // ── Per-Kid Rewards ────────────────────────────────────────────────────────
    if (wb.SheetNames.includes('rewards')) {
      const rows = xlsx.utils.sheet_to_json(wb.Sheets['rewards'], { header: 1, defval: '' });
      const header = rows[0] || [];

      KIDS.forEach(kid => {
        const nameCol = header.findIndex(h => h && h.toString().includes(kid));
        if (nameCol === -1) return;
        const costCol = nameCol + 1;
        result.rewards[kid] = rows.slice(1)
          .filter(r => (r[nameCol] || '').toString().trim() !== '')
          .map((r, i) => ({
            id: `${kid}-${i}`,
            name: r[nameCol].toString().trim(),
            cost: parseInt(r[costCol]) || 0,
          }));
      });
    }

    return result;
  } catch (err) {
    console.error('Excel parse error:', err);
    return null;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#0a0e27',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true,
    titleBarStyle: 'default'
  });

  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('load-data', async () => {
  const defaultRuntime = {
    kids: ['Jackson', 'Natalie', 'Brooke'],
    last_date: {},
    choices: {},
    completion_times: {},
    trophy_counts: {
      Jackson: { '1': 0, '2': 0, '3': 0 },
      Natalie: { '1': 0, '2': 0, '3': 0 },
      Brooke:  { '1': 0, '2': 0, '3': 0 },
    },
    credits:      { Jackson: 0, Natalie: 0, Brooke: 0 },
    redeemed:     { Jackson: [], Natalie: [], Brooke: [] },
    goal_log:     { Jackson: [], Natalie: [], Brooke: [] },
    completion_log: { Jackson: [], Natalie: [], Brooke: [] },
    config: { am_hour: 7, am_min: 20, pm_hour: 19, pm_min: 0, credits_per_goal: 1, password: '1234' },
  };

  let savedData;
  try {
    const raw = await fs.readFile(SAVE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    savedData = { ...defaultRuntime, ...parsed, config: { ...defaultRuntime.config, ...parsed.config } };
  } catch {
    savedData = { ...defaultRuntime };
  }

  // Merge Excel config on top — always fresh from file
  const excelConfig = parseExcelData(EXCEL_FILE);
  if (excelConfig) {
    savedData.tasks   = excelConfig.tasks;
    savedData.food    = excelConfig.food;
    savedData.rewards = excelConfig.rewards;
    savedData.goals   = excelConfig.goals;
  }

  return savedData;
});

ipcMain.handle('save-data', async (event, data) => {
  // Strip Excel-sourced config — only persist runtime state
  const { tasks, food, rewards, goals, ...runtime } = data;
  try {
    await fs.writeFile(SAVE_FILE, JSON.stringify(runtime, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-excel-tasks', async (event, { tasks, goals }) => {
  try {
    const wb = xlsx.readFile(EXCEL_FILE);
    const modeSheets = {
      morning:   'morning_tasks',
      afternoon: 'afternoon_tasks',
      weekend:   'weekend_tasks',
    };

    Object.entries(modeSheets).forEach(([mode, sheetName]) => {
      const modeTasks = tasks[mode] || {};
      let header, maxLen, buildRow;

      if (mode === 'weekend') {
        header = KIDS.flatMap(k => [k, `${k} Goal`, `${k} Goal Credits`]);
        maxLen = Math.max(0, ...KIDS.map(k =>
          Math.max((modeTasks[k] || []).length, (goals[k] || []).length)
        ));
        buildRow = i => KIDS.flatMap(k => {
          const rawGoal = (goals[k] || [])[i];
          const goalName = !rawGoal ? '' : (typeof rawGoal === 'string' ? rawGoal : rawGoal.name || '');
          const goalCredits = rawGoal && typeof rawGoal === 'object' ? rawGoal.credits : '';
          return [(modeTasks[k] || [])[i] || '', goalName, goalCredits];
        });
      } else {
        header = KIDS.map(k => k);
        maxLen = Math.max(0, ...KIDS.map(k => (modeTasks[k] || []).length));
        buildRow = i => KIDS.map(k => (modeTasks[k] || [])[i] || '');
      }

      const rows = [header, ...Array.from({ length: maxLen }, (_, i) => buildRow(i))];
      if (!wb.SheetNames.includes(sheetName)) wb.SheetNames.push(sheetName);
      wb.Sheets[sheetName] = xlsx.utils.aoa_to_sheet(rows);
    });

    xlsx.writeFile(wb, EXCEL_FILE);
    return { success: true };
  } catch (err) {
    console.error('write-excel-tasks error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('write-excel-rewards', async (event, rewards) => {
  try {
    const wb = xlsx.readFile(EXCEL_FILE);
    const header = KIDS.flatMap(k => [k, `${k} Cost`]);
    const maxLen = Math.max(0, ...KIDS.map(k => (rewards[k] || []).length));
    const rows = [header];
    for (let i = 0; i < maxLen; i++) {
      rows.push(KIDS.flatMap(k => {
        const r = (rewards[k] || [])[i];
        return r ? [r.name, r.cost] : ['', ''];
      }));
    }
    if (!wb.SheetNames.includes('rewards')) wb.SheetNames.push('rewards');
    wb.Sheets['rewards'] = xlsx.utils.aoa_to_sheet(rows);
    xlsx.writeFile(wb, EXCEL_FILE);
    return { success: true };
  } catch (err) {
    console.error('write-excel-rewards error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('write-excel-food', async (event, food) => {
  try {
    const wb = xlsx.readFile(EXCEL_FILE);
    const categories = [
      { key: 'breakfast',             name: 'Breakfast' },
      { key: 'special_breakfast',     name: 'Special Breakfast' },
      { key: 'lunch_main',            name: 'Lunch Main' },
      { key: 'lunch_sides_healthy',   name: 'Lunch Sides Healthy' },
      { key: 'lunch_sides_unhealthy', name: 'Lunch Sides Unhealthy' },
      { key: 'snacks',                name: 'Snacks' },
    ];

    const header = categories.flatMap(c => [c.name, 'Inventory']);
    const maxLen = Math.max(0, ...categories.map(c => (food[c.key] || []).length));
    const rows = [header];
    for (let i = 0; i < maxLen; i++) {
      rows.push(categories.flatMap(c => {
        const item = (food[c.key] || [])[i];
        if (!item) return ['', ''];
        // Support both object { name, inStock } and legacy plain string
        const name = typeof item === 'string' ? item : item.name;
        const inv  = typeof item === 'string' ? 'yes' : (item.inStock ? 'yes' : 'no');
        return [name, inv];
      }));
    }

    if (!wb.SheetNames.includes('morning_options')) wb.SheetNames.push('morning_options');
    wb.Sheets['morning_options'] = xlsx.utils.aoa_to_sheet(rows);
    xlsx.writeFile(wb, EXCEL_FILE);
    return { success: true };
  } catch (err) {
    console.error('write-excel-food error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-menu-image', async () => {
  try {
    const imgPath = path.join(app.getAppPath(), 'lunch_menu.jpg');
    const buf = await fs.readFile(imgPath);
    return `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
});

ipcMain.handle('load-csv', async (event, filename) => {
  try {
    const csvPath = path.join(app.getPath('userData'), filename);
    const content = await fs.readFile(csvPath, 'utf8');
    return content;
  } catch {
    return null;
  }
});
