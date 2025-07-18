# 🐍 Modern Snake Game - Rắn Săn Mồi 2025

A modern, fully refactored Snake game built with **React 18**, **TypeScript**, and **Vite** - using the hottest web technologies of 2025!

![Snake Game Modern](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF?style=for-the-badge&logo=vite)

## ✨ Features

### 🎮 Modern Gameplay

- **Smooth animations** with CSS transitions and keyframes
- **Responsive design** that works on desktop, tablet, and mobile
- **Progressive difficulty** with multiple levels and obstacles
- **Special food** with bonus points and timer
- **Real-time statistics** tracking

### 🎨 Modern UI/UX

- **Glassmorphism design** with backdrop blur effects
- **Gradient backgrounds** and modern color schemes
- **Animated buttons** with hover effects
- **Mobile-friendly controls** with touch support
- **Visual feedback** for all game states

### 🔊 Audio Experience

- **Web Audio API** generated sound effects
- **Dynamic sounds** for eating, special food, game over, and level up
- **Sound toggle** with persistent settings
- **No external audio files** required

### 💾 Data Persistence

- **Local storage** for high scores and settings
- **Game statistics** tracking (games played, average score, etc.)
- **Export/Import** game data functionality
- **Automatic save** on game over

### 🏗️ Modern Architecture

- **React Hooks** for state management
- **TypeScript** for type safety
- **Custom hooks** for game logic separation
- **Component-based** architecture
- **Utility functions** for reusable logic

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/khanhnguyentuann/snake-game.git
   cd snake-game
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

### Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Check for linting issues
npm run lint:fix        # Auto-fix linting issues
npm run lint:check      # Strict linting (fail on warnings)
npm run type-check      # TypeScript type checking
```

## 🎯 How to Play

### Controls

- **Arrow Keys** or **WASD** - Move the snake
- **Spacebar** - Pause/Resume game
- **Enter** - Start game from menu
- **R** - Reset game

### Mobile Controls

- **Touch buttons** for directional movement
- **Tap controls** for pause/resume

### Gameplay

- 🔴 **Red food** - +1 point
- 🔵 **Blue special food** - +5 points (appears every 12 points, disappears after 6 seconds)
- 🏆 **Level up** - Every 15 points, adds obstacles and increases speed
- ⚠️ **Avoid** - Walls, obstacles, and your own body

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── GameBoard.tsx   # Game rendering canvas
│   ├── GameControls.tsx # Control buttons and mobile controls
│   ├── GameStats.tsx   # Score, time, level display
│   └── GameOver.tsx    # Game over modal
├── hooks/              # Custom React hooks
│   └── useGameLogic.ts # Main game logic hook
├── types/              # TypeScript type definitions
│   └── game.ts         # Game-related types
├── utils/              # Utility functions
│   ├── gameUtils.ts    # Game logic utilities
│   ├── soundUtils.ts   # Web Audio API sound generation
│   └── storageUtils.ts # Local storage management
├── App.tsx             # Main app component
├── main.tsx           # React app entry point
└── index.css          # Global styles
```

## 🔧 Technologies Used

### Core Framework

- **React 18.2.0** - Modern React with concurrent features
- **TypeScript 5.0.2** - Type-safe JavaScript
- **Vite 4.4.5** - Lightning-fast build tool

### Code Quality & Development

- **ESLint** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **React ESLint plugins** - React and React Hooks linting
- **Consistent code style** - 2-space indentation, single quotes, semicolons

### UI & Styling

- **CSS3** - Modern CSS with custom properties
- **Lucide React** - Beautiful icon library
- **Responsive Design** - Mobile-first approach
- **Mobile-optimized** - Scales properly on all devices

### Audio

- **Web Audio API** - Native browser audio generation
- **Dynamic Sound Effects** - Procedurally generated sounds

### Storage

- **localStorage** - Client-side data persistence
- **JSON serialization** - Data export/import

## 🎨 Design Philosophy

This refactor transforms the original Pygame-based Snake game into a modern web application following 2025's best practices:

### From Python/Pygame to React/TypeScript

- **Pygame rendering** → **HTML5 Canvas-like div positioning**
- **Python classes** → **React functional components with hooks**
- **Pygame event handling** → **React event handlers and keyboard listeners**
- **File-based high scores** → **localStorage with JSON**

### Modern Web Standards

- **ES2020+ features** - Modern JavaScript syntax
- **CSS Grid & Flexbox** - Modern layout techniques
- **Web APIs** - Audio, Storage, and more
- **Progressive Enhancement** - Works without JavaScript for basic functionality

## 🚀 Performance Optimizations

- **React.memo** for component optimization
- **useCallback** for function memoization
- **Efficient re-renders** with proper dependency arrays
- **CSS animations** instead of JavaScript animations
- **Minimal bundle size** with tree shaking

## 🌟 Future Enhancements

- [ ] **Multiplayer mode** with WebRTC
- [ ] **Online leaderboards** with Firebase
- [ ] **Power-ups** and special abilities
- [ ] **Themes** and customization options
- [ ] **Progressive Web App** (PWA) support
- [ ] **WebGL rendering** for advanced graphics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Python/Pygame version inspiration
- React and TypeScript communities
- Modern web development best practices
- Vietnamese gaming community

---

**Made with ❤️ using the hottest web technologies of 2025!**

🔗 **Live Demo**: [Coming Soon]
📧 **Contact**: [Your Email]
🐙 **GitHub**: [Your GitHub Profile]
