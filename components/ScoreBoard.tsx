
import React from 'react';
import { Team } from '../types';

interface ScoreBoardProps {
  teams: [Team, Team];
  activeTeamId: 1 | 2;
  roundScore: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ teams, activeTeamId, roundScore }) => {
  const team1 = teams[0];
  const team2 = teams[1];
  
  const totalPoints = (team1.score + team2.score) || 1;
  const t1Percent = (team1.score / totalPoints) * 100;

  const getPlayerName = (team: Team) => {
    if (!team.participants || team.participants.length === 0) return 'Player';
    return team.participants[team.currentPlayerIndex] || team.participants[0] || 'Player';
  };

  return (
    <div className="w-full mb-8 space-y-4">
      <div className="flex justify-between items-center gap-4 relative">
        {/* Team 1 */}
        <div className={`flex-1 p-4 rounded-2xl transition-all duration-500 border-b-4 ${activeTeamId === 1 ? 'bg-rose-50 border-rose-500 scale-105 shadow-lg' : 'bg-slate-50 border-transparent opacity-70'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTeamId === 1 ? 'bg-rose-500 text-white animate-bounce' : 'bg-slate-200 text-slate-500'}`}>
              <i className="fa-solid fa-fire"></i>
            </div>
            <div>
              <p className="text-xs font-black text-rose-400 uppercase tracking-widest">Team One</p>
              <h3 className="text-lg font-bold text-slate-800 truncate">{team1.name}</h3>
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-rose-600">{team1.score}</div>
          {activeTeamId === 1 && (
            <p className="text-[10px] font-bold text-rose-400 mt-1 animate-pulse">
              UP NOW: {getPlayerName(team1)}
            </p>
          )}
        </div>

        {/* VS Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-black italic border-4 border-white shadow-xl">
            VS
          </div>
        </div>

        {/* Team 2 */}
        <div className={`flex-1 p-4 rounded-2xl text-right transition-all duration-500 border-b-4 ${activeTeamId === 2 ? 'bg-blue-50 border-blue-500 scale-105 shadow-lg' : 'bg-slate-50 border-transparent opacity-70'}`}>
          <div className="flex flex-row-reverse items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTeamId === 2 ? 'bg-blue-500 text-white animate-bounce' : 'bg-slate-200 text-slate-500'}`}>
              <i className="fa-solid fa-bolt"></i>
            </div>
            <div>
              <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Team Two</p>
              <h3 className="text-lg font-bold text-slate-800 truncate">{team2.name}</h3>
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-blue-600">{team2.score}</div>
          {activeTeamId === 2 && (
            <p className="text-[10px] font-bold text-blue-400 mt-1 animate-pulse text-right">
              UP NOW: {getPlayerName(team2)}
            </p>
          )}
        </div>
      </div>

      {/* Battle Progress Bar */}
      <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        <div 
          className="h-full bg-rose-500 transition-all duration-1000" 
          style={{ width: `${t1Percent}%` }}
        />
        <div 
          className="h-full bg-blue-500 transition-all duration-1000" 
          style={{ width: `${100 - t1Percent}%` }}
        />
      </div>
    </div>
  );
};
