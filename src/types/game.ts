export interface Position {
    x: number;
    y: number;
}

export interface GameState {
    snake: Position[];
    food: Position;
    specialFood: Position | null;
    direction: Direction;
    score: number;
    highScore: number;
    level: number;
    gameStatus: 'playing' | 'paused' | 'gameOver' | 'menu';
    obstacles: Position[];
    specialFoodTimer: number;
    gameTime: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface GameConfig {
    boardWidth: number;
    boardHeight: number;
    cellSize: number;
    initialSpeed: number;
    specialFoodDuration: number;
    specialFoodScore: number;
    levelUpScore: number;
}

export interface SoundEffects {
    eat: () => void;
    specialEat: () => void;
    gameOver: () => void;
    levelUp: () => void;
}
