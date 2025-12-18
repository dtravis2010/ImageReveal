
import React from 'react';

interface GameBoardProps {
  image: string;
  gridSize: number;
  revealedTiles: Set<number>;
  onTileClick: (index: number) => void;
  isSolved: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ image, gridSize, revealedTiles, onTileClick, isSolved }) => {
  const totalTiles = gridSize * gridSize;

  return (
    <div 
      className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 shadow-2xl border-2 border-slate-800"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        gap: '0px' // Ensure absolutely no gaps
      }}
    >
      {/* The background image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* The Tiles Overlay - No gaps, no borders */}
      {Array.from({ length: totalTiles }).map((_, i) => (
        <div
          key={i}
          onClick={() => !revealedTiles.has(i) && onTileClick(i)}
          className={`
            relative z-10 w-full h-full cursor-pointer transition-all duration-300
            ${revealedTiles.has(i) 
              ? 'opacity-0 scale-100 pointer-events-none' 
              : 'bg-slate-800 hover:bg-slate-700 opacity-100'}
          `}
        >
          {/* Subtle interaction effect only on hover */}
          {!revealedTiles.has(i) && (
            <div className="absolute inset-0 opacity-0 hover:opacity-10 bg-white/10 transition-opacity" />
          )}
        </div>
      ))}

      {/* Solved Overlay */}
      {isSolved && (
        <div className="absolute inset-0 z-30 pointer-events-none ring-8 ring-green-500 ring-inset animate-pulse"></div>
      )}
    </div>
  );
};
