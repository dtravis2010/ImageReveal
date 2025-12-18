import React, { useState, useEffect } from 'react';
import { User } from '../gameTypes';
import { subscribeToUsers, updateUserStatus } from '../firebaseService';

interface LobbyViewProps {
  currentUserId: string;
  isHost: boolean;
  onStartMatch: (player1Id: string, player2Id: string) => void;
  onGoToScoreboard: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ 
  currentUserId, 
  isHost, 
  onStartMatch,
  onGoToScoreboard 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [recentlyMatched, setRecentlyMatched] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = subscribeToUsers((users) => {
      setUsers(users);
    });
    return () => unsubscribe();
  }, []);

  const availablePlayers = users.filter(u => u.status === 'available');
  const inMatchPlayers = users.filter(u => u.status === 'in_match');

  const selectRandomPlayers = (): [string, string] | null => {
    // Get players who haven't been recently matched
    const notRecentlyMatched = availablePlayers.filter(p => !recentlyMatched.has(p.id));
    
    // If we've used everyone, reset the cycle
    const pool = notRecentlyMatched.length >= 2 ? notRecentlyMatched : availablePlayers;
    
    if (pool.length < 2) return null;

    // Shuffle and pick two
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const player1 = shuffled[0].id;
    const player2 = shuffled[1].id;

    // Mark as recently matched
    const newRecentlyMatched = new Set(recentlyMatched);
    newRecentlyMatched.add(player1);
    newRecentlyMatched.add(player2);
    
    // If we've matched everyone, reset
    if (newRecentlyMatched.size >= availablePlayers.length) {
      setRecentlyMatched(new Set([player1, player2]));
    } else {
      setRecentlyMatched(newRecentlyMatched);
    }

    return [player1, player2];
  };

  const handleStartMatch = () => {
    const players = selectRandomPlayers();
    if (players) {
      onStartMatch(players[0], players[1]);
    }
  };

  const handleToggleAvailable = async () => {
    const currentUser = users.find(u => u.id === currentUserId);
    if (currentUser) {
      const newStatus = currentUser.status === 'available' ? 'in_match' : 'available';
      await updateUserStatus(currentUserId, newStatus);
    }
  };

  const currentUser = users.find(u => u.id === currentUserId);
  const isCurrentUserAvailable = currentUser?.status === 'available';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-slate-800 mb-2 tracking-tight">
            <i className="fa-solid fa-gamepad text-indigo-600 mr-3"></i>
            Game Lobby
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            {availablePlayers.length} player{availablePlayers.length !== 1 ? 's' : ''} ready to play
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {isHost && (
            <button
              onClick={handleStartMatch}
              disabled={availablePlayers.length < 2}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xl font-black rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-bolt mr-2"></i>
              Start Match
            </button>
          )}
          
          {!isHost && (
            <button
              onClick={handleToggleAvailable}
              className={`px-8 py-4 text-xl font-black rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                isCurrentUserAvailable
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
              }`}
            >
              <i className={`fa-solid ${isCurrentUserAvailable ? 'fa-check-circle' : 'fa-pause-circle'} mr-2`}></i>
              {isCurrentUserAvailable ? 'Available' : 'Not Available'}
            </button>
          )}

          <button
            onClick={onGoToScoreboard}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white text-xl font-black rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-trophy mr-2"></i>
            Scoreboard
          </button>
        </div>

        {/* Players Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Available Players */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                <i className="fa-solid fa-circle text-green-500 text-sm mr-2"></i>
                Available
              </h2>
              <span className="text-3xl font-black text-green-600">{availablePlayers.length}</span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availablePlayers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-users text-slate-300 text-2xl"></i>
                  </div>
                  <p className="text-slate-400 font-medium">No players available</p>
                </div>
              ) : (
                availablePlayers.map(user => (
                  <div
                    key={user.id}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      user.id === currentUserId
                        ? 'bg-indigo-50 border-indigo-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.isHost ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                        }`}>
                          <i className={`fa-solid ${user.isHost ? 'fa-crown' : 'fa-user'}`}></i>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {user.displayName}
                            {user.id === currentUserId && (
                              <span className="ml-2 text-xs text-indigo-600">(You)</span>
                            )}
                          </p>
                          {user.isHost && (
                            <p className="text-xs text-amber-600 font-bold uppercase">Host</p>
                          )}
                        </div>
                      </div>
                      <i className="fa-solid fa-check-circle text-green-500 text-xl"></i>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* In Match Players */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                <i className="fa-solid fa-circle text-orange-500 text-sm mr-2"></i>
                In Match
              </h2>
              <span className="text-3xl font-black text-orange-600">{inMatchPlayers.length}</span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {inMatchPlayers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-gamepad text-slate-300 text-2xl"></i>
                  </div>
                  <p className="text-slate-400 font-medium">No active matches</p>
                </div>
              ) : (
                inMatchPlayers.map(user => (
                  <div
                    key={user.id}
                    className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.displayName}</p>
                          <p className="text-xs text-orange-600 font-bold uppercase">Playing</p>
                        </div>
                      </div>
                      <i className="fa-solid fa-bolt text-orange-500 text-xl animate-pulse"></i>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions for non-hosts */}
        {!isHost && (
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
            <i className="fa-solid fa-info-circle text-blue-600 text-2xl mb-2"></i>
            <p className="text-blue-800 font-medium">
              Make sure you're marked as "Available" to be selected for the next match!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
