import React from 'react';
import { Trophy, Clock, Target, Zap } from 'lucide-react';
import { GameState } from '../types/game';
import { formatTime } from '../utils/gameUtils';

interface GameStatsProps {
    gameState: GameState;
}

const GameStats: React.FC<GameStatsProps> = ({ gameState }) => {
    const { score, highScore, level, gameTime, specialFoodTimer } = gameState;

    return (
        <div className="game-stats">
            <div className="stat-item">
                <Target size={20} />
                <span>Điểm: <span className="stat-value">{score}</span></span>
            </div>

            <div className="stat-item">
                <Trophy size={20} />
                <span>Cao nhất: <span className="stat-value">{highScore}</span></span>
            </div>

            <div className="stat-item">
                <Clock size={20} />
                <span>Thời gian: <span className="stat-value">{formatTime(gameTime)}</span></span>
            </div>

            <div className="level-indicator">
                <Zap size={16} />
                <span>Level {level}</span>
            </div>

            {specialFoodTimer > 0 && (
                <div className="special-food-timer">
                    <span>Thức ăn đặc biệt: {Math.ceil(specialFoodTimer / 1000)}s</span>
                </div>
            )}
        </div>
    );
};

export default GameStats;
