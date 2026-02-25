# 🚀 Quick Start Guide

## Installation (5 minutes)

### 1. Install Node.js
- Visit https://nodejs.org/
- Download the **LTS version** (recommended)
- Run the installer
- Accept all defaults
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Open Terminal/Command Prompt
- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type `terminal`, press Enter
- **Linux**: Press `Ctrl + Alt + T`

### 3. Navigate to Project
```bash
cd path/to/adventure-hub-react
```

### 4. Install Dependencies
```bash
npm install
```
This will take 2-3 minutes. It's downloading all the libraries.

### 5. Run the App!
```bash
npm run electron-dev
```

The app will open automatically!

## First Time Setup

When the app opens, you'll see:
- 3 kid cards (Jackson, Natalie, Brooke)
- Each starts with some credits
- Click **START QUEST** to begin

### Try These:
1. Click **Trophy Room** to see medals
2. Click **Goal Room** to see achievements
3. Click **Admin** to adjust credits/trophies
4. Click **START QUEST** on a kid card to:
   - Check off tasks
   - Select food options
   - Track progress

## Building a Standalone App

### Windows Users
```bash
npm run build
npx electron-builder --windows
```
You'll get a `.exe` file in `dist/` folder

### Mac Users
```bash
npm run build
npx electron-builder --mac
```
You'll get a `.dmg` file in `dist/` folder

### Linux Users
```bash
npm run build
npx electron-builder --linux
```
You'll get an `.AppImage` file in `dist/` folder

## Common Issues

### "npm not found"
→ Install Node.js first

### "Port 3000 already in use"
→ Close other apps using port 3000, or:
```bash
# Kill the process
npx kill-port 3000
# Then retry
npm run electron-dev
```

### "Module not found"
→ Delete and reinstall:
```bash
rm -rf node_modules
npm install
```

### White screen
→ Wait 30 seconds for React to build
→ Or check DevTools for errors (View → Toggle Developer Tools)

## Development Mode vs Production

**Development Mode** (`npm run electron-dev`):
- Hot reload enabled
- Shows DevTools
- Faster iteration
- Use this while customizing

**Production Build** (`npm run build`):
- Optimized & minified
- No DevTools
- Smaller file size
- Use this for final distribution

## Next Steps

1. **Customize colors** - Edit `src/App.css`
2. **Change kids' names** - Edit `src/App.js`
3. **Add more tasks** - Edit `src/components/KidQuest.js`
4. **Modify food options** - Same file as tasks

## Need Help?

Check the full README.md for detailed documentation!

---

**You're all set!** Enjoy your space-themed morning routine app! 🚀✨
