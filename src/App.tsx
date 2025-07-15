import React, { useEffect, useCallback, useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { getDirectionFromKey } from './utils/gameUtils';
import GameBoard from './components/GameBoard';
import GameStats from './components/GameStats';
import GameControls from './components/GameControls';
import GameOver from './components/GameOver';
import HelpModal from './components/HelpModal';

const App: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);
  const {
    gameState,
    gameConfig,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
  } = useGameLogic();

  // Handle keyboard input
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    event.preventDefault();

    // Pause/Resume with spacebar
    if (event.code === 'Space') {
      if (gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused') {
        pauseGame();
      }
      return;
    }

    // Start game with Enter
    if (event.code === 'Enter' && gameState.gameStatus === 'menu') {
      startGame();
      return;
    }

    // Reset game with R
    if (event.code === 'KeyR') {
      resetGame();
      return;
    }

    // Direction controls
    const direction = getDirectionFromKey(event.key);
    if (direction && gameState.gameStatus === 'playing') {
      changeDirection(direction);
    }
  }, [gameState.gameStatus, pauseGame, startGame, resetGame, changeDirection]);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Prevent context menu on right click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const handleBackToMenu = () => {
    resetGame();
  };

  const handleRestart = () => {
    startGame();
  };

  return (
    <div className="game-container">
      <h1 className="game-title">🐍 Rắn Săn Mồi Modern</h1>

      <GameStats gameState={gameState} />

      <GameBoard gameState={gameState} gameConfig={gameConfig} />

      <GameControls
        gameState={gameState}
        onStartGame={startGame}
        onPauseGame={pauseGame}
        onResetGame={resetGame}
        onChangeDirection={changeDirection}
        onShowHelp={() => setShowHelp(true)}
      />

      <GameOver
        gameState={gameState}
        onRestart={handleRestart}
        onBackToMenu={handleBackToMenu}
      />

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
};

export default App;
