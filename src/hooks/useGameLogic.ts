import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Direction, GameConfig } from '../types/game';
import { generateFood, generateObstacles, checkCollision, getOppositeDirection } from '../utils/gameUtils';
import { playSound } from '../utils/soundUtils';
import { saveHighScore, getHighScore } from '../utils/storageUtils';

const GAME_CONFIG: GameConfig = {
  boardWidth: 40,
  boardHeight: 30,
  cellSize: 20,
  initialSpeed: 150,
  specialFoodDuration: 6000,
  specialFoodScore: 5,
  levelUpScore: 15,
};

const initialGameState: GameState = {
  snake: [{ x: 20, y: 15 }, { x: 19, y: 15 }, { x: 18, y: 15 }],
  food: { x: 25, y: 15 },
  specialFood: null,
  direction: 'RIGHT',
  score: 0,
  highScore: 0,
  level: 1,
  gameStatus: 'menu',
  obstacles: [],
  specialFoodTimer: 0,
  gameTime: 0,
};

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // Direction queue system to prevent race conditions
  const directionQueueRef = useRef<Direction[]>([]);
  const currentDirectionRef = useRef<Direction>('RIGHT');
  const lastProcessedDirectionRef = useRef<Direction>('RIGHT');
  const directionChangeTimeRef = useRef<number>(0);

  // Game loop and timers refs
  const gameLoopRef = useRef<number>();
  const specialFoodTimerRef = useRef<number>();
  const gameTimeRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  // Direction debouncing constants
  const DIRECTION_DEBOUNCE_MS = 50; // Minimum time between direction changes
  const MAX_QUEUE_SIZE = 3; // Maximum queued directions

  // Initialize high score
  useEffect(() => {
    const highScore = getHighScore();
    setGameState(prev => ({ ...prev, highScore }));
  }, []);

  // Process direction queue
  const processDirectionQueue = useCallback(() => {
    const now = Date.now();

    if (directionQueueRef.current.length === 0) {
      return currentDirectionRef.current;
    }

    // Check if enough time has passed since last direction change
    if (now - directionChangeTimeRef.current < DIRECTION_DEBOUNCE_MS) {
      return currentDirectionRef.current;
    }

    const nextDirection = directionQueueRef.current.shift();
    if (!nextDirection) {
      return currentDirectionRef.current;
    }

    // Validate direction change (prevent reverse moves)
    if (nextDirection === getOppositeDirection(lastProcessedDirectionRef.current)) {
      // Skip invalid direction and try next in queue
      return processDirectionQueue();
    }

    // Update direction references
    currentDirectionRef.current = nextDirection;
    directionChangeTimeRef.current = now;

    return nextDirection;
  }, []);

  // Game loop with fixed direction processing
  const gameLoop = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameStatus !== 'playing') {
        return prevState;
      }

      // Process direction queue before moving
      const actualDirection = processDirectionQueue();
      lastProcessedDirectionRef.current = actualDirection;

      const newSnake = [...prevState.snake];
      const head = { ...newSnake[0] };

      // Move snake head based on processed direction
      switch (actualDirection) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
      }

      // Check wall collision
      if (
        head.x < 0 ||
        head.x >= GAME_CONFIG.boardWidth ||
        head.y < 0 ||
        head.y >= GAME_CONFIG.boardHeight
      ) {
        playSound('gameOver');
        const finalScore = prevState.score;
        if (finalScore > prevState.highScore) {
          saveHighScore(finalScore);
        }
        return { ...prevState, gameStatus: 'gameOver' };
      }

      // Check self collision
      if (checkCollision(head, newSnake)) {
        playSound('gameOver');
        const finalScore = prevState.score;
        if (finalScore > prevState.highScore) {
          saveHighScore(finalScore);
        }
        return { ...prevState, gameStatus: 'gameOver' };
      }

      // Check obstacle collision
      if (checkCollision(head, prevState.obstacles)) {
        playSound('gameOver');
        const finalScore = prevState.score;
        if (finalScore > prevState.highScore) {
          saveHighScore(finalScore);
        }
        return { ...prevState, gameStatus: 'gameOver' };
      }

      newSnake.unshift(head);

      let newScore = prevState.score;
      let newFood = prevState.food;
      let newSpecialFood = prevState.specialFood;
      let shouldGrow = false;

      // Check food collision
      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        newScore += 1;
        shouldGrow = true;
        playSound('eat');
        newFood = generateFood(GAME_CONFIG.boardWidth, GAME_CONFIG.boardHeight, newSnake, prevState.obstacles);

        // Generate special food every 12 points
        if (newScore % 12 === 0) {
          newSpecialFood = generateFood(GAME_CONFIG.boardWidth, GAME_CONFIG.boardHeight, newSnake, prevState.obstacles);
        }
      }

      // Check special food collision
      if (newSpecialFood && head.x === newSpecialFood.x && head.y === newSpecialFood.y) {
        newScore += GAME_CONFIG.specialFoodScore;
        shouldGrow = true;
        playSound('specialEat');
        newSpecialFood = null;
      }

      if (!shouldGrow) {
        newSnake.pop();
      }

      // Check level up
      let newLevel = prevState.level;
      let newObstacles = prevState.obstacles;
      if (newScore >= GAME_CONFIG.levelUpScore && newLevel <= Math.floor(newScore / GAME_CONFIG.levelUpScore)) {
        newLevel = Math.floor(newScore / GAME_CONFIG.levelUpScore) + 1;
        newObstacles = generateObstacles(newLevel, GAME_CONFIG.boardWidth, GAME_CONFIG.boardHeight);
        playSound('levelUp');
      }

      // Update high score
      let newHighScore = prevState.highScore;
      if (newScore > newHighScore) {
        newHighScore = newScore;
        saveHighScore(newHighScore);
      }

      return {
        ...prevState,
        snake: newSnake,
        food: newFood,
        specialFood: newSpecialFood,
        direction: actualDirection, // Update state direction
        score: newScore,
        highScore: newHighScore,
        level: newLevel,
        obstacles: newObstacles,
      };
    });
  }, [processDirectionQueue]);

  // Clear all intervals safely
  const clearAllIntervals = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }
    if (specialFoodTimerRef.current) {
      clearTimeout(specialFoodTimerRef.current);
      specialFoodTimerRef.current = undefined;
    }
    if (gameTimeRef.current) {
      clearInterval(gameTimeRef.current);
      gameTimeRef.current = undefined;
    }
  }, []);

  // Start game loop with proper cleanup
  const startGameLoop = useCallback(() => {
    clearAllIntervals();

    const speed = Math.max(50, GAME_CONFIG.initialSpeed - (gameState.level - 1) * 20);
    gameLoopRef.current = window.setInterval(gameLoop, speed);
  }, [gameLoop, gameState.level, clearAllIntervals]);

  // Special food timer with pause support
  const startSpecialFoodTimer = useCallback(() => {
    if (specialFoodTimerRef.current) {
      clearTimeout(specialFoodTimerRef.current);
    }

    specialFoodTimerRef.current = window.setTimeout(() => {
      setGameState(prev => {
        // Only remove special food if game is still playing
        if (prev.gameStatus === 'playing') {
          return { ...prev, specialFood: null, specialFoodTimer: 0 };
        }
        return prev;
      });
    }, GAME_CONFIG.specialFoodDuration);
  }, []);

  // Game time tracker
  const startGameTime = useCallback(() => {
    startTimeRef.current = Date.now();
    if (gameTimeRef.current) {
      clearInterval(gameTimeRef.current);
    }

    gameTimeRef.current = window.setInterval(() => {
      setGameState(prev => {
        // Only update time if game is playing (not paused)
        if (prev.gameStatus === 'playing') {
          return {
            ...prev,
            gameTime: Math.floor((Date.now() - startTimeRef.current) / 1000),
          };
        }
        return prev;
      });
    }, 1000);
  }, []);

  // Game controls
  const startGame = useCallback(() => {
    clearAllIntervals();

    // Reset direction system
    directionQueueRef.current = [];
    currentDirectionRef.current = 'RIGHT';
    lastProcessedDirectionRef.current = 'RIGHT';
    directionChangeTimeRef.current = 0;

    const newFood = generateFood(GAME_CONFIG.boardWidth, GAME_CONFIG.boardHeight, initialGameState.snake, []);
    setGameState(prev => ({
      ...initialGameState,
      food: newFood,
      gameStatus: 'playing',
      highScore: prev.highScore,
      gameTime: 0,
    }));

    startGameLoop();
    startGameTime();
  }, [startGameLoop, startGameTime, clearAllIntervals]);

  const pauseGame = useCallback(() => {
    setGameState(prev => {
      const newStatus = prev.gameStatus === 'paused' ? 'playing' : 'paused';

      if (newStatus === 'paused') {
        // Pause all timers
        clearAllIntervals();
      } else {
        // Resume game
        startGameLoop();
        startGameTime();
      }

      return { ...prev, gameStatus: newStatus };
    });
  }, [startGameLoop, startGameTime, clearAllIntervals]);

  const resetGame = useCallback(() => {
    clearAllIntervals();

    // Reset direction system
    directionQueueRef.current = [];
    currentDirectionRef.current = 'RIGHT';
    lastProcessedDirectionRef.current = 'RIGHT';
    directionChangeTimeRef.current = 0;

    setGameState(prev => ({
      ...initialGameState,
      highScore: prev.highScore,
      gameStatus: 'menu',
    }));
  }, [clearAllIntervals]);

  const changeDirection = useCallback((newDirection: Direction) => {
    if (gameState.gameStatus !== 'playing') {
      return;
    }

    const now = Date.now();

    // Immediate validation against current processed direction
    if (newDirection === getOppositeDirection(lastProcessedDirectionRef.current)) {
      return;
    }

    // Prevent too frequent inputs
    if (now - directionChangeTimeRef.current < DIRECTION_DEBOUNCE_MS / 2) {
      return;
    }

    // Add to queue if not already present and queue not full
    if (
      !directionQueueRef.current.includes(newDirection) &&
      directionQueueRef.current.length < MAX_QUEUE_SIZE
    ) {
      directionQueueRef.current.push(newDirection);
    }
  }, [gameState.gameStatus]);

  // Handle special food timer with pause support
  useEffect(() => {
    if (gameState.specialFood && gameState.gameStatus === 'playing') {
      startSpecialFoodTimer();
      setGameState(prev => ({ ...prev, specialFoodTimer: GAME_CONFIG.specialFoodDuration }));

      const timerInterval = setInterval(() => {
        setGameState(prev => {
          // Only countdown if game is playing
          if (prev.gameStatus !== 'playing') {
            return prev;
          }

          if (prev.specialFoodTimer <= 0) {
            clearInterval(timerInterval);
            return prev;
          }
          return { ...prev, specialFoodTimer: prev.specialFoodTimer - 100 };
        });
      }, 100);

      return () => clearInterval(timerInterval);
    }
  }, [gameState.specialFood, gameState.gameStatus, startSpecialFoodTimer]);

  // Handle game loop based on status
  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      startGameLoop();
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
    };
  }, [gameState.gameStatus, startGameLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllIntervals();
    };
  }, [clearAllIntervals]);

  return {
    gameState,
    gameConfig: GAME_CONFIG,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
  };
};