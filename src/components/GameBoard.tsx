import React from 'react';
import { GameState, GameConfig } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  gameConfig: GameConfig;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, gameConfig }) => {
  const { boardWidth, boardHeight, cellSize } = gameConfig;
  const { snake, food, specialFood, obstacles, gameStatus } = gameState;

  // Calculate responsive cell size based on container
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [responsiveCellSize, setResponsiveCellSize] = React.useState(cellSize);

  React.useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate cell size to fit the container while maintaining aspect ratio
        const maxCellWidth = Math.floor(containerWidth / boardWidth);
        const maxCellHeight = Math.floor(containerHeight / boardHeight);
        const newCellSize = Math.min(maxCellWidth, maxCellHeight, cellSize);
        
        setResponsiveCellSize(Math.max(newCellSize, 8)); // Minimum 8px cells
      }
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [boardWidth, boardHeight, cellSize]);

  const boardStyle = {
    width: boardWidth * responsiveCellSize,
    height: boardHeight * responsiveCellSize,
    position: 'relative' as const,
    backgroundColor: '#000',
    margin: '0 auto',
  };

  const getCellStyle = (x: number, y: number) => ({
    position: 'absolute' as const,
    left: x * responsiveCellSize,
    top: y * responsiveCellSize,
    width: responsiveCellSize,
    height: responsiveCellSize,
  });

  const renderSnake = () => {
    return snake.map((segment, index) => (
      <div
        key={`snake-${index}`}
        style={{
          ...getCellStyle(segment.x, segment.y),
          backgroundColor: index === 0 ? '#4ade80' : '#22c55e', // Head is lighter green
          border: '1px solid #16a34a',
          borderRadius: index === 0 ? '6px' : '3px',
          boxShadow: index === 0 ? '0 0 10px rgba(74, 222, 128, 0.5)' : 'none',
          zIndex: 10,
        }}
      />
    ));
  };

  const renderFood = () => (
    <div
      style={{
        ...getCellStyle(food.x, food.y),
        backgroundColor: '#ef4444',
        border: '2px solid #dc2626',
        borderRadius: '50%',
        boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)',
        zIndex: 5,
        animation: 'pulse 1s infinite',
      }}
    />
  );

  const renderSpecialFood = () => {
    if (!specialFood) {
      return null;
    }

    return (
      <div
        style={{
          ...getCellStyle(specialFood.x, specialFood.y),
          backgroundColor: '#3b82f6',
          border: '2px solid #2563eb',
          borderRadius: '50%',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
          zIndex: 5,
          animation: 'specialPulse 0.5s infinite',
        }}
      />
    );
  };

  const renderObstacles = () => {
    return obstacles.map((obstacle, index) => (
      <div
        key={`obstacle-${index}`}
        style={{
          ...getCellStyle(obstacle.x, obstacle.y),
          backgroundColor: '#6b7280',
          border: '1px solid #4b5563',
          borderRadius: '2px',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
          zIndex: 3,
        }}
      />
    ));
  };

  const renderGrid = () => {
    const gridLines: React.ReactElement[] = [];

    // Vertical lines - ensure consistent thickness
    for (let x = 0; x <= boardWidth; x++) {
      const isEdge = x === 0 || x === boardWidth;
      gridLines.push(
        <div
          key={`v-${x}`}
          style={{
            position: 'absolute',
            left: x * responsiveCellSize - (isEdge ? 0 : 0.5),
            top: 0,
            width: isEdge ? '1px' : '1px',
            height: boardHeight * responsiveCellSize,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            zIndex: 1,
          }}
        />,
      );
    }

    // Horizontal lines - ensure consistent thickness
    for (let y = 0; y <= boardHeight; y++) {
      const isEdge = y === 0 || y === boardHeight;
      gridLines.push(
        <div
          key={`h-${y}`}
          style={{
            position: 'absolute',
            left: 0,
            top: y * responsiveCellSize - (isEdge ? 0 : 0.5),
            width: boardWidth * responsiveCellSize,
            height: isEdge ? '1px' : '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            zIndex: 1,
          }}
        />,
      );
    }

    return gridLines;
  };

  return (
    <div className="game-board" ref={containerRef} style={boardStyle}>
      {renderGrid()}
      {renderObstacles()}
      {renderFood()}
      {renderSpecialFood()}
      {renderSnake()}

      {gameStatus === 'paused' && (
        <div className="paused-overlay">
          <div>GAME PAUSED</div>
          <div style={{ fontSize: '1rem', marginTop: '10px' }}>
            Press SPACE or click Pause to continue
          </div>
        </div>
      )}

    </div>
  );
};

export default GameBoard;
