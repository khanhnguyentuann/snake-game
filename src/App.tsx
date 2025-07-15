import React, { useEffect, useCallback } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { getDirectionFromKey } from './utils/gameUtils';
import GameBoard from './components/GameBoard';
import GameStats from './components/GameStats';
import GameControls from './components/GameControls';
import GameOver from './components/GameOver';

const App: React.FC = () => {
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
      />

      <GameOver
        gameState={gameState}
        onRestart={handleRestart}
        onBackToMenu={handleBackToMenu}
      />

      {gameState.gameStatus === 'menu' && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderRadius: '15px',
          border: '2px solid rgba(79, 70, 229, 0.2)',
        }}>
          <h3 style={{ color: '#4f46e5', marginBottom: '15px' }}>
                        🎮 Chào mừng đến với Snake Game Modern!
          </h3>
          <p style={{ marginBottom: '10px', color: '#374151' }}>
                        Trò chơi rắn săn mồi được làm mới với công nghệ React + TypeScript hiện đại nhất 2025!
          </p>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            <p>✨ <strong>Tính năng mới:</strong></p>
            <ul style={{ textAlign: 'left', marginLeft: '20px' }}>
              <li>Giao diện hiện đại với hiệu ứng đẹp mắt</li>
              <li>Âm thanh sinh động</li>
              <li>Nhiều level thử thách</li>
              <li>Thức ăn đặc biệt với điểm thưởng</li>
              <li>Responsive design cho mọi thiết bị</li>
              <li>Lưu điểm cao tự động</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
