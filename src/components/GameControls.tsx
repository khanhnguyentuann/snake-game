import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { GameState, Direction } from '../types/game';
import { toggleSound, isSoundEnabled } from '../utils/soundUtils';

interface GameControlsProps {
    gameState: GameState;
    onStartGame: () => void;
    onPauseGame: () => void;
    onResetGame: () => void;
    onChangeDirection: (direction: Direction) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onStartGame,
  onPauseGame,
  onResetGame,
  onChangeDirection,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(isSoundEnabled());

  const handleToggleSound = () => {
    const newSoundState = toggleSound();
    setSoundEnabled(newSoundState);
  };

  const handleDirectionChange = (direction: Direction) => {
    onChangeDirection(direction);
  };

  return (
    <div>
      {/* Main Controls */}
      <div className="game-controls">
        {gameState.gameStatus === 'menu' && (
          <button className="btn btn-success" onClick={onStartGame}>
            <Play size={20} />
                        Bắt đầu chơi
          </button>
        )}

        {gameState.gameStatus === 'playing' && (
          <button className="btn btn-warning" onClick={onPauseGame}>
            <Pause size={20} />
                        Tạm dừng
          </button>
        )}

        {gameState.gameStatus === 'paused' && (
          <button className="btn btn-success" onClick={onPauseGame}>
            <Play size={20} />
                        Tiếp tục
          </button>
        )}

        <button className="btn btn-primary" onClick={onResetGame}>
          <RotateCcw size={20} />
                    Chơi lại
        </button>

        <button className="btn btn-primary" onClick={handleToggleSound}>
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          {soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        </button>
      </div>

      {/* Mobile Controls */}
      <div className="mobile-controls">
        <button
          className="mobile-btn"
          onClick={() => handleDirectionChange('UP')}
          disabled={gameState.gameStatus !== 'playing'}
        >
          <ArrowUp size={24} />
        </button>
        <button
          className="mobile-btn"
          onClick={() => handleDirectionChange('LEFT')}
          disabled={gameState.gameStatus !== 'playing'}
        >
          <ArrowLeft size={24} />
        </button>
        <button
          className="mobile-btn"
          onClick={() => handleDirectionChange('RIGHT')}
          disabled={gameState.gameStatus !== 'playing'}
        >
          <ArrowRight size={24} />
        </button>
        <button
          className="mobile-btn"
          onClick={() => handleDirectionChange('DOWN')}
          disabled={gameState.gameStatus !== 'playing'}
        >
          <ArrowDown size={24} />
        </button>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#6b7280' }}>
        <p><strong>Điều khiển:</strong></p>
        <p>• Phím mũi tên hoặc WASD để di chuyển</p>
        <p>• SPACE để tạm dừng/tiếp tục</p>
        <p>• Ăn thức ăn đỏ để tăng điểm (+1)</p>
        <p>• Ăn thức ăn xanh để được điểm thưởng (+5)</p>
        <p>• Tránh va chạm vào tường, chướng ngại vật và chính mình</p>
      </div>
    </div>
  );
};

export default GameControls;
