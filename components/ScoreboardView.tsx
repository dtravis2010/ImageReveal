import React, { useState, useEffect } from 'react';
import { Scoreboard, User } from '../gameTypes';
import { subscribeToScoreboard, clearScoreboard } from '../firebaseService';
import { exportToCSV } from '../utils';

interface ScoreboardViewProps {
  eventId: string;
  users: User[];
  isHost: boolean;
  onBackToLobby: () => void;
}

export const ScoreboardView: React.FC<ScoreboardViewProps> = ({
  eventId,
  users,
  isHost,
  onBackToLobby
}) => {
  const [scoreboard, setScoreboard] = useState<Scoreboard | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToScoreboard(eventId, setScoreboard);
    return () => unsubscribe();
  }, [eventId]);

  const handleClearScoreboard = async () => {
    if (window.confirm('Are you sure you want to clear the scoreboard? This cannot be undone.')) {
      await clearScoreboard(eventId);
    }
  };

  const handleExportScoreboard = () => {
    if (!scoreboard) return;
    
    const data = Object.entries(scoreboard.totals).map(([userId, score]) => {
      const user = users.find(u => u.id === userId);
      return {
        name: user?.displayName || 'Unknown',
        wins: score.wins,
        plays: score.plays,
        winRate: score.plays > 0 ? ((score.wins / score.plays) * 100).toFixed(1) : '0',
        fastestMs: score.fastestMs || 'N/A'
      };
    });

    exportToCSV(data, `scoreboard_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const leaderboard = scoreboard ? 
    Object.entries(scoreboard.totals)
      .map(([userId, score]) => {
        const user = users.find(u => u.id === userId);
        return {
          userId,
          name: user?.displayName || 'Unknown',
          ...score,
          winRate: score.plays > 0 ? (score.wins / score.plays) * 100 : 0
        };
      })
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (a.fastestMs && b.fastestMs) return a.fastestMs - b.fastestMs;
        return 0;
      })
    : [];

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-2 tracking-tight">
            <i className="fa-solid fa-trophy text-amber-500 mr-3"></i>
            Scoreboard
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            {leaderboard.length} player{leaderboard.length !== 1 ? 's' : ''} competing
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={onBackToLobby}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-black rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back to Lobby
          </button>

          {isHost && (
            <>
              <button
                onClick={handleExportScoreboard}
                disabled={!scoreboard || leaderboard.length === 0}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-black rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                <i className="fa-solid fa-download mr-2"></i>
                Export CSV
              </button>

              <button
                onClick={handleClearScoreboard}
                disabled={!scoreboard}
                className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white text-xl font-black rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                <i className="fa-solid fa-trash mr-2"></i>
                Clear Scores
              </button>
            </>
          )}
        </div>

        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-chart-line text-slate-300 text-4xl"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">No Games Played Yet</h2>
            <p className="text-slate-500 font-medium">Start a round to see scores appear here!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div className="md:order-1 md:mt-12">
                    <div className="bg-gradient-to-br from-slate-300 to-slate-400 rounded-3xl shadow-xl p-6 text-center">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-4xl font-black text-slate-500">2</span>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">{topThree[1].name}</h3>
                      <div className="bg-white/20 rounded-2xl p-4 space-y-1">
                        <p className="text-white text-3xl font-black">{topThree[1].wins} <span className="text-sm">wins</span></p>
                        <p className="text-white/80 text-sm">{topThree[1].plays} plays • {topThree[1].winRate.toFixed(0)}% win rate</p>
                        {topThree[1].fastestMs && (
                          <p className="text-white/80 text-xs">⚡ {(topThree[1].fastestMs / 1000).toFixed(2)}s fastest</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                <div className="md:order-2">
                  <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl shadow-2xl p-8 text-center transform md:scale-110">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <i className="fa-solid fa-crown text-5xl text-amber-500"></i>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-3">{topThree[0].name}</h3>
                    <div className="bg-white/30 rounded-2xl p-6 space-y-2">
                      <p className="text-white text-4xl font-black">{topThree[0].wins} <span className="text-lg">wins</span></p>
                      <p className="text-white/90 font-bold">{topThree[0].plays} plays • {topThree[0].winRate.toFixed(0)}% win rate</p>
                      {topThree[0].fastestMs && (
                        <p className="text-white/90 text-sm">⚡ {(topThree[0].fastestMs / 1000).toFixed(2)}s fastest</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                {topThree[2] && (
                  <div className="md:order-3 md:mt-12">
                    <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl shadow-xl p-6 text-center">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-4xl font-black text-orange-500">3</span>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">{topThree[2].name}</h3>
                      <div className="bg-white/20 rounded-2xl p-4 space-y-1">
                        <p className="text-white text-3xl font-black">{topThree[2].wins} <span className="text-sm">wins</span></p>
                        <p className="text-white/80 text-sm">{topThree[2].plays} plays • {topThree[2].winRate.toFixed(0)}% win rate</p>
                        {topThree[2].fastestMs && (
                          <p className="text-white/80 text-xs">⚡ {(topThree[2].fastestMs / 1000).toFixed(2)}s fastest</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rest of Leaderboard */}
            {rest.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h2 className="text-2xl font-black text-slate-800 mb-4">Full Rankings</h2>
                <div className="space-y-2">
                  {rest.map((player, idx) => (
                    <div
                      key={player.userId}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-black text-slate-600">{idx + 4}</span>
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{player.name}</p>
                        <p className="text-sm text-slate-600">
                          {player.wins} wins • {player.plays} plays • {player.winRate.toFixed(0)}% win rate
                          {player.fastestMs && ` • ⚡ ${(player.fastestMs / 1000).toFixed(2)}s`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
