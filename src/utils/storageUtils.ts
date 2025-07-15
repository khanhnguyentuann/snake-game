const HIGH_SCORE_KEY = 'snakeGameHighScore';
const GAME_SETTINGS_KEY = 'snakeGameSettings';

export interface GameSettings {
    soundEnabled: boolean;
    theme: 'light' | 'dark';
    difficulty: 'easy' | 'medium' | 'hard';
}

const defaultSettings: GameSettings = {
  soundEnabled: true,
  theme: 'light',
  difficulty: 'medium',
};

// High Score Management
export const getHighScore = (): number => {
  try {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

export const saveHighScore = (score: number): void => {
  try {
    const currentHighScore = getHighScore();
    if (score > currentHighScore) {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  } catch {
    // Failed to save high score - silently fail
  }
};

export const resetHighScore = (): void => {
  try {
    localStorage.removeItem(HIGH_SCORE_KEY);
  } catch {
    // Failed to reset high score - silently fail
  }
};

// Game Settings Management
export const getGameSettings = (): GameSettings => {
  try {
    const stored = localStorage.getItem(GAME_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  } catch {
    return defaultSettings;
  }
};

export const saveGameSettings = (settings: Partial<GameSettings>): void => {
  try {
    const currentSettings = getGameSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(newSettings));
  } catch {
    // Failed to save game settings - silently fail
  }
};

export const resetGameSettings = (): void => {
  try {
    localStorage.removeItem(GAME_SETTINGS_KEY);
  } catch {
    // Failed to reset game settings - silently fail
  }
};

// Game Statistics
export interface GameStats {
    gamesPlayed: number;
    totalScore: number;
    averageScore: number;
    bestTime: number;
    totalPlayTime: number;
    levelsReached: number[];
}

const GAME_STATS_KEY = 'snakeGameStats';

const defaultStats: GameStats = {
  gamesPlayed: 0,
  totalScore: 0,
  averageScore: 0,
  bestTime: 0,
  totalPlayTime: 0,
  levelsReached: [],
};

export const getGameStats = (): GameStats => {
  try {
    const stored = localStorage.getItem(GAME_STATS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultStats, ...parsed };
    }
    return defaultStats;
  } catch {
    return defaultStats;
  }
};

export const updateGameStats = (gameData: {
    score: number;
    playTime: number;
    level: number;
}): void => {
  try {
    const currentStats = getGameStats();
    const newStats: GameStats = {
      gamesPlayed: currentStats.gamesPlayed + 1,
      totalScore: currentStats.totalScore + gameData.score,
      averageScore: Math.round((currentStats.totalScore + gameData.score) / (currentStats.gamesPlayed + 1)),
      bestTime: Math.max(currentStats.bestTime, gameData.playTime),
      totalPlayTime: currentStats.totalPlayTime + gameData.playTime,
      levelsReached: [...new Set([...currentStats.levelsReached, gameData.level])].sort((a, b) => a - b),
    };

    localStorage.setItem(GAME_STATS_KEY, JSON.stringify(newStats));
  } catch {
    // Failed to update game stats - silently fail
  }
};

export const resetGameStats = (): void => {
  try {
    localStorage.removeItem(GAME_STATS_KEY);
  } catch {
    // Failed to reset game stats - silently fail
  }
};

// Export/Import Data
export const exportGameData = (): string => {
  try {
    const data = {
      highScore: getHighScore(),
      settings: getGameSettings(),
      stats: getGameStats(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  } catch {
    return '';
  }
};

export const importGameData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);

    if (data.highScore && typeof data.highScore === 'number') {
      saveHighScore(data.highScore);
    }

    if (data.settings && typeof data.settings === 'object') {
      saveGameSettings(data.settings);
    }

    if (data.stats && typeof data.stats === 'object') {
      localStorage.setItem(GAME_STATS_KEY, JSON.stringify(data.stats));
    }

    return true;
  } catch {
    return false;
  }
};

// Clear all game data
export const clearAllGameData = (): void => {
  try {
    resetHighScore();
    resetGameSettings();
    resetGameStats();
  } catch {
    // Failed to clear all game data - silently fail
  }
};

// Check if localStorage is available
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
