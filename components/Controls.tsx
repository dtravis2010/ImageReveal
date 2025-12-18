
import React from 'react';

interface ControlsProps {
  onRevealRandom: () => void;
  isGameActive: boolean;
  revealCount: number;
  totalTiles: number;
}

export const Controls: React.FC<ControlsProps> = ({ 
  onRevealRandom, 
  isGameActive,
  revealCount,
  totalTiles 
}) => {
  const progress = Math.round((revealCount / totalTiles) * 100);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Reveal Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
