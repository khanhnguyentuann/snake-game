import { Position, Direction } from '../types/game';

export const generateFood = (
  boardWidth: number,
  boardHeight: number,
  snake: Position[],
  obstacles: Position[],
): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * boardWidth),
      y: Math.floor(Math.random() * boardHeight),
    };
  } while (
    checkCollision(food, snake) ||
        checkCollision(food, obstacles)
  );
  return food;
};

export const generateObstacles = (
  level: number,
  boardWidth: number,
  boardHeight: number,
): Position[] => {
  const obstacles: Position[] = [];

  if (level === 1) {
    return obstacles;
  }

  // Level 2: Vertical walls
  if (level === 2) {
    // Left vertical wall
    for (let y = 5; y < 25; y++) {
      obstacles.push({ x: 15, y });
    }
    // Right vertical wall
    for (let y = 5; y < 25; y++) {
      obstacles.push({ x: 24, y });
    }
  }

  // Level 3: Cross pattern
  if (level === 3) {
    // Horizontal line
    for (let x = 10; x < 30; x++) {
      obstacles.push({ x, y: 15 });
    }
    // Vertical line
    for (let y = 8; y < 22; y++) {
      obstacles.push({ x: 20, y });
    }
  }

  // Level 4: Border walls
  if (level === 4) {
    // Top and bottom borders
    for (let x = 5; x < 35; x++) {
      obstacles.push({ x, y: 5 });
      obstacles.push({ x, y: 24 });
    }
    // Left and right borders
    for (let y = 5; y < 25; y++) {
      obstacles.push({ x: 5, y });
      obstacles.push({ x: 34, y });
    }
  }

  // Level 5+: Random obstacles
  if (level >= 5) {
    const obstacleCount = Math.min(level * 3, 30);
    for (let i = 0; i < obstacleCount; i++) {
      let obstacle: Position;
      do {
        obstacle = {
          x: Math.floor(Math.random() * boardWidth),
          y: Math.floor(Math.random() * boardHeight),
        };
      } while (
      // Avoid center area where snake starts
        (obstacle.x >= 18 && obstacle.x <= 22 && obstacle.y >= 13 && obstacle.y <= 17) ||
                checkCollision(obstacle, obstacles)
      );
      obstacles.push(obstacle);
    }
  }

  return obstacles;
};

export const checkCollision = (position: Position, positions: Position[]): boolean => {
  return positions.some(pos => pos.x === position.x && pos.y === position.y);
};

export const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
  case 'UP':
    return 'DOWN';
  case 'DOWN':
    return 'UP';
  case 'LEFT':
    return 'RIGHT';
  case 'RIGHT':
    return 'LEFT';
  default:
    return direction;
  }
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getDirectionFromKey = (key: string): Direction | null => {
  switch (key) {
  case 'ArrowUp':
  case 'w':
  case 'W':
    return 'UP';
  case 'ArrowDown':
  case 's':
  case 'S':
    return 'DOWN';
  case 'ArrowLeft':
  case 'a':
  case 'A':
    return 'LEFT';
  case 'ArrowRight':
  case 'd':
  case 'D':
    return 'RIGHT';
  default:
    return null;
  }
};

export const calculateScore = (baseScore: number, level: number, timeBonus: boolean = false): number => {
  let score = baseScore;

  // Level multiplier
  score *= level;

  // Time bonus (if applicable)
  if (timeBonus) {
    score += Math.floor(score * 0.1);
  }

  return score;
};

export const isValidMove = (
  newDirection: Direction,
  currentDirection: Direction,
): boolean => {
  return newDirection !== getOppositeDirection(currentDirection);
};
