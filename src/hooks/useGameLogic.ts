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
  const gameLoopRef = useRef<number>();
  const specialFoodTimerRef = useRef<number>();
  const gameTimeRef = useRef<number>();
  const lastDirectionRef = useRef<Direction>('RIGHT');
  const startTimeRef = useRef<number>(0);

  // Initialize high score
  useEffect(() => {
    const highScore = getHighScore();
    setGameState(prev => ({ ...prev, highScore }));
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameStatus !== 'playing') {
        return prevState;
      }

      const newSnake = [...prevState.snake];
      const head = { ...newSnake[0] };

      // Move snake head
      switch (prevState.direction) {
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
        score: newScore,
        highScore: newHighScore,
        level: newLevel,
        obstacles: newObstacles,
      };
    });
  }, []);

  // Start game loop
  const startGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    const speed = Math.max(50, GAME_CONFIG.initialSpeed - (gameState.level - 1) * 20);
    gameLoopRef.current = window.setInterval(gameLoop, speed);
  }, [gameLoop, gameState.level]);

  // Special food timer
  const startSpecialFoodTimer = useCallback(() => {
    if (specialFoodTimerRef.current) {
      clearTimeout(specialFoodTimerRef.current);
    }

    specialFoodTimerRef.current = window.setTimeout(() => {
      setGameState(prev => ({ ...prev, specialFood: null, specialFoodTimer: 0 }));
    }, GAME_CONFIG.specialFoodDuration);
  }, []);

  // Game time tracker
  const startGameTime = useCallback(() => {
    startTimeRef.current = Date.now();
    if (gameTimeRef.current) {
      clearInterval(gameTimeRef.current);
    }

    gameTimeRef.current = window.setInterval(() => {
      setGameState(prev => ({
        ...prev,
        gameTime: Math.floor((Date.now() - startTimeRef.current) / 1000),
      }));
    }, 1000);
  }, []);

  // Game controls
  const startGame = useCallback(() => {
    const newFood = generateFood(GAME_CONFIG.boardWidth, GAME_CONFIG.boardHeight, initialGameState.snake, []);
    setGameState(prev => ({
      ...initialGameState,
      food: newFood,
      gameStatus: 'playing',
      highScore: prev.highScore,
      gameTime: 0,
    }));
    lastDirectionRef.current = 'RIGHT';
    startGameLoop();
    startGameTime();
  }, [startGameLoop, startGameTime]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === 'paused' ? 'playing' : 'paused',
    }));
  }, []);

  const resetGame = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    if (specialFoodTimerRef.current) {
      clearTimeout(specialFoodTimerRef.current);
    }
    if (gameTimeRef.current) {
      clearInterval(gameTimeRef.current);
    }

    setGameState(prev => ({
      ...initialGameState,
      highScore: prev.highScore,
      gameStatus: 'menu',
    }));
    lastDirectionRef.current = 'RIGHT';
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    if (gameState.gameStatus !== 'playing') {
      return;
    }

    // Prevent reverse direction
    if (newDirection === getOppositeDirection(lastDirectionRef.current)) {
      return;
    }

    setGameState(prev => ({ ...prev, direction: newDirection }));
    lastDirectionRef.current = newDirection;
  }, [gameState.gameStatus]);

  // Handle special food timer
  useEffect(() => {
    if (gameState.specialFood && gameState.gameStatus === 'playing') {
      startSpecialFoodTimer();
      setGameState(prev => ({ ...prev, specialFoodTimer: GAME_CONFIG.specialFoodDuration }));

      const timerInterval = setInterval(() => {
        setGameState(prev => {
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
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.gameStatus, startGameLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (specialFoodTimerRef.current) {
        clearTimeout(specialFoodTimerRef.current);
      }
      if (gameTimeRef.current) {
        clearInterval(gameTimeRef.current);
      }
    };
  }, []);

  return {
    gameState,
    gameConfig: GAME_CONFIG,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
  };
};
