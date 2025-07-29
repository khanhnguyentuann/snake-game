import { Position, Direction } from '../types/game';

export const generateFood = (
  boardWidth: number,
  boardHeight: number,
  snake: Position[],
  obstacles: Position[],
): Position => {
  let food: Position;
  let attempts = 0;
  const maxAttempts = 1000; // Prevent infinite loops

  do {
    food = {
      x: Math.floor(Math.random() * boardWidth),
      y: Math.floor(Math.random() * boardHeight),
    };
    attempts++;

    // If we can't find a valid position after many attempts, 
    // place food at a guaranteed safe position
    if (attempts > maxAttempts) {
      food = findSafePosition(boardWidth, boardHeight, snake, obstacles);
      break;
    }
  } while (
    checkCollision(food, snake) ||
    checkCollision(food, obstacles)
  );

  return food;
};

// Find a guaranteed safe position for food placement
const findSafePosition = (
  boardWidth: number,
  boardHeight: number,
  snake: Position[],
  obstacles: Position[],
): Position => {
  // Try center positions first
  const centerX = Math.floor(boardWidth / 2);
  const centerY = Math.floor(boardHeight / 2);

  const safeCandidates = [
    { x: centerX, y: centerY },
    { x: centerX + 1, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX, y: centerY + 1 },
    { x: centerX, y: centerY - 1 },
  ];

  for (const candidate of safeCandidates) {
    if (
      candidate.x >= 0 && candidate.x < boardWidth &&
      candidate.y >= 0 && candidate.y < boardHeight &&
      !checkCollision(candidate, snake) &&
      !checkCollision(candidate, obstacles)
    ) {
      return candidate;
    }
  }

  // Fallback: scan entire board
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const candidate = { x, y };
      if (
        !checkCollision(candidate, snake) &&
        !checkCollision(candidate, obstacles)
      ) {
        return candidate;
      }
    }
  }

  // Last resort: return a position that might overlap (shouldn't happen in normal gameplay)
  return { x: 0, y: 0 };
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

  // Define safe zone around snake starting position
  const safeZone = {
    minX: 15,
    maxX: 25,
    minY: 10,
    maxY: 20,
  };

  // Level 2: Vertical walls with gaps
  if (level === 2) {
    // Left vertical wall with gaps
    for (let y = 5; y < 25; y++) {
      if (y < safeZone.minY || y > safeZone.maxY) {
        obstacles.push({ x: 15, y });
      }
    }
    // Right vertical wall with gaps
    for (let y = 5; y < 25; y++) {
      if (y < safeZone.minY || y > safeZone.maxY) {
        obstacles.push({ x: 24, y });
      }
    }
  }

  // Level 3: Cross pattern with gaps
  if (level === 3) {
    // Horizontal line with gap in center
    for (let x = 10; x < 30; x++) {
      if (x < safeZone.minX || x > safeZone.maxX) {
        obstacles.push({ x, y: 15 });
      }
    }
    // Vertical line with gap in center
    for (let y = 8; y < 22; y++) {
      if (y < safeZone.minY || y > safeZone.maxY) {
        obstacles.push({ x: 20, y });
      }
    }
  }

  // Level 4: Border walls with openings
  if (level === 4) {
    // Top and bottom borders with openings
    for (let x = 5; x < 35; x++) {
      if (x < 15 || x > 25) { // Leave openings
        obstacles.push({ x, y: 5 });
        obstacles.push({ x, y: 24 });
      }
    }
    // Left and right borders with openings
    for (let y = 5; y < 25; y++) {
      if (y < 10 || y > 20) { // Leave openings
        obstacles.push({ x: 5, y });
        obstacles.push({ x: 34, y });
      }
    }
  }

  // Level 5+: Strategic random obstacles
  if (level >= 5) {
    const obstacleCount = Math.min(level * 2, 25); // Reduced max obstacles
    let placed = 0;
    let attempts = 0;
    const maxAttempts = obstacleCount * 10;

    while (placed < obstacleCount && attempts < maxAttempts) {
      const obstacle: Position = {
        x: Math.floor(Math.random() * boardWidth),
        y: Math.floor(Math.random() * boardHeight),
      };

      attempts++;

      // Skip if in safe zone or already occupied
      if (
        (obstacle.x >= safeZone.minX && obstacle.x <= safeZone.maxX &&
          obstacle.y >= safeZone.minY && obstacle.y <= safeZone.maxY) ||
        checkCollision(obstacle, obstacles)
      ) {
        continue;
      }

      // Ensure there's still a path to food by checking connectivity
      if (isPositionConnected(obstacle, boardWidth, boardHeight, [...obstacles, obstacle])) {
        obstacles.push(obstacle);
        placed++;
      }
    }
  }

  return obstacles;
};

// Check if placing an obstacle still allows connectivity
const isPositionConnected = (
  newObstacle: Position,
  boardWidth: number,
  boardHeight: number,
  allObstacles: Position[],
): boolean => {
  // Simple connectivity check: ensure we don't block all paths
  // Check if there are still multiple paths around the obstacle
  const neighbors = [
    { x: newObstacle.x + 1, y: newObstacle.y },
    { x: newObstacle.x - 1, y: newObstacle.y },
    { x: newObstacle.x, y: newObstacle.y + 1 },
    { x: newObstacle.x, y: newObstacle.y - 1 },
  ];

  let validNeighbors = 0;
  for (const neighbor of neighbors) {
    if (
      neighbor.x >= 0 && neighbor.x < boardWidth &&
      neighbor.y >= 0 && neighbor.y < boardHeight &&
      !checkCollision(neighbor, allObstacles)
    ) {
      validNeighbors++;
    }
  }

  // Allow placement if at least 2 sides are free
  return validNeighbors >= 2;
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

// Performance optimization: pre-validate directions
export const validateDirectionChange = (
  newDirection: Direction,
  currentDirection: Direction,
  lastChangeTime: number,
  minInterval: number = 50,
): boolean => {
  const now = Date.now();

  // Check timing
  if (now - lastChangeTime < minInterval) {
    return false;
  }

  // Check validity
  return isValidMove(newDirection, currentDirection);
};