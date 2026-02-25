# Adventure Hub - React + Electron Edition 🚀

A modern, beautifully animated kids' morning routine tracker built with React and Electron.

![Adventure Hub](screenshot.png)

## ✨ Features

- **Stunning Modern UI** - Glassmorphic cards, neon buttons, and smooth animations
- **Real-time Countdown** - Dynamic countdown timer to morning launch
- **Quest System** - Interactive task checklists with progress tracking
- **Trophy Room** - Hall of fame with medal animations
- **Goal Tracking** - Achievement logging system
- **Credit System** - Earn credits for completing quests
- **Admin Panel** - Easy management of credits and trophies
- **Cross-Platform** - Works on Windows, Mac, and Linux

## 🎮 What's New vs Python Version

### Visual Upgrades
- ✅ Animated glassmorphic cards with hover effects
- ✅ Gradient text and neon glowing buttons
- ✅ Smooth page transitions with Framer Motion
- ✅ Floating particles and ambient backgrounds
- ✅ Progress bars with shimmer effects
- ✅ 3D card rotations and scale animations

### Technical Upgrades
- ✅ Component-based architecture (easy to modify)
- ✅ Persistent data storage via Electron
- ✅ Hot reload during development
- ✅ Easy to package as .exe, .dmg, or .AppImage
- ✅ Responsive design (works on any screen size)

## 🚀 Installation

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Setup Steps

1. **Navigate to the project folder**
   ```bash
   cd adventure-hub-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run electron-dev
   ```
   This will:
   - Start the React development server
   - Launch the Electron app
   - Enable hot reload (changes update automatically)

## 📦 Building for Production

### Create a Distributable App

**For Windows (.exe):**
```bash
npm run build
npm run package
```

**For macOS (.dmg):**
```bash
npm run build
npm run package
```

**For Linux (.AppImage):**
```bash
npm run build
npm run package
```

The built app will be in the `dist/` folder.

## 🎨 Customization

### Change Colors
Edit `src/App.css` and modify the CSS variables:
```css
:root {
  --accent-primary: #00d4ff;    /* Main blue */
  --accent-secondary: #7b2ff7;  /* Purple */
  --accent-gold: #ffd700;       /* Gold */
  --success: #00ff88;           /* Green */
  --danger: #ff3860;            /* Red */
}
```

### Add More Kids
Edit `electron/main.js` and update the default data:
```javascript
kids: ["Jackson", "Natalie", "Brooke", "NewKid"]
```

### Change Tasks/Food Options
Modify the arrays in `src/components/KidQuest.js`:
```javascript
const mockTasks = [
  'Make bed',
  'Brush teeth',
  // Add your tasks here
];
```

### Modify Animations
All animations use Framer Motion. Edit the `variants` in any component:
```javascript
const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};
```

## 📁 Project Structure

```
adventure-hub-react/
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # Secure IPC bridge
├── public/
│   └── index.html       # HTML template
├── src/
│   ├── components/
│   │   ├── Dashboard.js      # Main kid cards view
│   │   ├── Dashboard.css
│   │   ├── KidQuest.js       # Individual quest screen
│   │   ├── KidQuest.css
│   │   ├── TrophyRoom.js     # Hall of fame
│   │   ├── TrophyRoom.css
│   │   ├── GoalRoom.js       # Achievement log
│   │   ├── GoalRoom.css
│   │   ├── AdminPanel.js     # Admin controls
│   │   └── AdminPanel.css
│   ├── App.js           # Main app component
│   ├── App.css          # Global styles
│   ├── index.js         # React entry point
│   └── index.css
└── package.json         # Dependencies & scripts
```

## 🎯 Key Components

### Dashboard
- Displays all kids with their current quest status
- Shows countdown timer
- Animated cards with rankings
- Quick access to Trophy Room and Goal Room

### KidQuest
- Individual task checklist
- Food selection wizard (for morning mode)
- Real-time progress tracking
- Completion detection with victory notification

### TrophyRoom
- Animated medal displays
- 3D card effects on hover
- Floating particle decorations
- Trophy count statistics

### AdminPanel
- Credit management
- Trophy adjustments
- Master reset functionality
- Dangerous actions protected with confirmations

## 🔧 Development Tips

### Hot Reload
When running `npm run electron-dev`, any changes to React components will auto-update. For Electron main process changes, restart the app.

### Debugging
- React DevTools work in the Electron window
- Open DevTools: View → Toggle Developer Tools
- Console logs appear in the DevTools console

### Adding New Pages
1. Create component in `src/components/`
2. Add route in `App.js`
3. Create CSS file for styling
4. Add navigation button

## 🐛 Troubleshooting

**App won't start:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**White screen on launch:**
- Check console for errors (View → DevTools)
- Ensure `npm start` is running before Electron launches
- Try: `npm run build` then `npm run electron`

**Data not saving:**
- Check file permissions in user data folder
- Look for errors in DevTools console
- Data saves to: `~/Library/Application Support/adventure-hub` (Mac)

## 🎨 Design Philosophy

This app uses:
- **Glassmorphism** - Semi-transparent cards with backdrop blur
- **Neon aesthetics** - Glowing buttons and accent colors
- **Space theme** - Mission control, launches, quests
- **Smooth animations** - Framer Motion for all transitions
- **Dark mode first** - Optimized for eye comfort

## 📝 Future Enhancements

Ideas for further development:
- [ ] CSV import/export for tasks and rewards
- [ ] Sound effects for completions
- [ ] Victory video playback
- [ ] Multi-language support
- [ ] Cloud sync between devices
- [ ] Mobile companion app
- [ ] Reward redemption system
- [ ] Custom avatar uploads

## 🤝 Contributing

Feel free to fork and customize! This is your app now.

## 📄 License

MIT License - Use freely!

## 🎉 Enjoy!

Your kids will love the new look! The animations and modern UI make morning routines actually fun.

---

**Questions?** The code is well-commented. Explore and modify to your heart's content! 🚀
