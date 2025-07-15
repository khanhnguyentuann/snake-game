import React from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { GameState } from '../types/game';
import { formatTime } from '../utils/gameUtils';
import { updateGameStats } from '../utils/storageUtils';

interface GameOverProps {
    gameState: GameState;
    onRestart: () => void;
    onBackToMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ gameState, onRestart, onBackToMenu }) => {
    const { score, highScore, level, gameTime } = gameState;
    const isNewHighScore = score > 0 && score >= highScore;

    React.useEffect(() => {
        // Update game statistics when game over
        if (gameState.gameStatus === 'gameOver') {
            updateGameStats({
                score,
                playTime: gameTime,
                level,
            });
        }
    }, [gameState.gameStatus, score, gameTime, level]);

    if (gameState.gameStatus !== 'gameOver') {
        return null;
    }

    return (
        <div className="game-over">
            <div className="game-over-content">
                <div className="game-over-title">
                    Game Over!
                </div>

                {isNewHighScore && (
                    <div style={{
                        color: '#10b981',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        animation: 'pulse 1s infinite',
                    }}>
                        🎉 Kỷ lục mới! 🎉
                    </div>
                )}

                <div className="final-score">
                    <div>Điểm số: <strong>{score}</strong></div>
                    <div>Kỷ lục: <strong>{highScore}</strong></div>
                    <div>Level đạt được: <strong>{level}</strong></div>
                    <div>Thời gian chơi: <strong>{formatTime(gameTime)}</strong></div>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button className="btn btn-success" onClick={onRestart}>
                        <RotateCcw size={20} />
                        Chơi lại
                    </button>

                    <button className="btn btn-primary" onClick={onBackToMenu}>
                        <Home size={20} />
                        Menu chính
                    </button>
                </div>

                <div style={{
                    marginTop: '20px',
                    fontSize: '0.9rem',
                    color: '#6b7280',
                    textAlign: 'center',
                }}>
                    {score >= 50 && 'Xuất sắc! Bạn là một cao thủ rắn săn mồi!'}
                    {score >= 30 && score < 50 && 'Tuyệt vời! Bạn đã chơi rất tốt!'}
                    {score >= 15 && score < 30 && 'Khá tốt! Hãy thử thách bản thân ở level cao hơn!'}
                    {score >= 5 && score < 15 && 'Không tệ! Tiếp tục luyện tập nhé!'}
                    {score < 5 && 'Đừng bỏ cuộc! Hãy thử lại!'}
                </div>
            </div>
        </div>
    );
};

export default GameOver;
