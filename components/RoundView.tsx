import React, { useState, useEffect } from 'react';
import { Round, Guess, User } from '../gameTypes';
import { subscribeToGuesses, submitGuess, updateRound, updateScoreboard, updateUserStatus } from '../firebaseService';
import { isAnswerCorrect } from '../utils';
import confetti from 'canvas-confetti';

interface RoundViewProps {
  round: Round;
  currentUserId: string;
  currentUserName: string;
  isHost: boolean;
  eventId: string;
  users: User[];
  onRoundEnd: () => void;
}

export const RoundView: React.FC<RoundViewProps> = ({
  round,
  currentUserId,
  currentUserName,
  isHost,
  eventId,
  users,
  onRoundEnd
}) => {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [guessInput, setGuessInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isParticipant = round.playerIds.includes(currentUserId);
  const player1 = users.find(u => u.id === round.playerIds[0]);
  const player2 = users.find(u => u.id === round.playerIds[1]);

  useEffect(() => {
    const unsubscribe = subscribeToGuesses(round.id, (newGuesses) => {
      setGuesses(newGuesses);
      
      // Check for correct guess
      if (round.status === 'active') {
        const correctGuess = newGuesses.find(g => 
          isAnswerCorrect(g.text, round.answer) && !g.isCorrect
        );
        
        if (correctGuess) {
          handleCorrectGuess(correctGuess);
        }
      }
    });

    return () => unsubscribe();
  }, [round.id, round.answer, round.status]);

  const handleCorrectGuess = async (correctGuess: Guess) => {
    const endTime = Date.now();
    const duration = round.startedAt ? endTime - round.startedAt : 0;
    
    // Update round
    await updateRound(round.id, {
      status: 'ended',
      winnerId: correctGuess.playerId,
      endedAt: endTime
    });

    // Update scoreboard
    await updateScoreboard(eventId, correctGuess.playerId, {
      wins: 1,
      plays: 1,
      fastestMs: duration
    });

    // Update the loser's scoreboard
    const loserId = round.playerIds.find(id => id !== correctGuess.playerId);
    if (loserId) {
      await updateScoreboard(eventId, loserId, {
        wins: 0,
        plays: 1,
        fastestMs: null
      });
    }

    // Set both players back to available
    await updateUserStatus(round.playerIds[0], 'available');
    await updateUserStatus(round.playerIds[1], 'available');

    // Confetti!
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim() || !isParticipant || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitGuess(round.id, currentUserId, currentUserName, guessInput);
      setGuessInput('');
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
    setIsSubmitting(false);
  };

  const handleHostOverride = async (winnerId: string) => {
    const endTime = Date.now();
    const duration = round.startedAt ? endTime - round.startedAt : 0;
    
    await updateRound(round.id, {
      status: 'ended',
      winnerId,
      endedAt: endTime
    });

    await updateScoreboard(eventId, winnerId, {
      wins: 1,
      plays: 1,
      fastestMs: duration
    });

    const loserId = round.playerIds.find(id => id !== winnerId);
    if (loserId) {
      await updateScoreboard(eventId, loserId, {
        wins: 0,
        plays: 1,
        fastestMs: null
      });
    }

    await updateUserStatus(round.playerIds[0], 'available');
    await updateUserStatus(round.playerIds[1], 'available');
    
    confetti({ particleCount: 100, spread: 60 });
  };

  const handleCancelRound = async () => {
    await updateRound(round.id, {
      status: 'ended',
      endedAt: Date.now()
    });
    await updateUserStatus(round.playerIds[0], 'available');
    await updateUserStatus(round.playerIds[1], 'available');
  };

  if (round.status === 'ended') {
    const winner = users.find(u => u.id === round.winnerId);
    const duration = round.startedAt && round.endedAt ? ((round.endedAt - round.startedAt) / 1000).toFixed(1) : '0';

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center space-y-6 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <i className="fa-solid fa-trophy text-6xl text-green-600"></i>
          </div>
          
          <h1 className="text-5xl font-black text-slate-800 tracking-tight">
            Round Complete!
          </h1>
          
          {winner && (
            <>
              <p className="text-2xl text-slate-600 font-bold">
                🎉 <span className="text-green-600">{winner.displayName}</span> wins! 🎉
              </p>
              <p className="text-lg text-slate-500">
                Time: <span className="font-bold">{duration}s</span>
              </p>
            </>
          )}

          <button
            onClick={onRoundEnd}
            className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xl font-black rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Players */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1 bg-blue-500 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-user text-2xl"></i>
                </div>
                <div>
                  <p className="text-sm opacity-80 font-bold uppercase">Player 1</p>
                  <p className="text-2xl font-black">{player1?.displayName || 'Loading...'}</p>
                </div>
              </div>
            </div>

            <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-xl shadow-xl">
              VS
            </div>

            <div className="flex-1 bg-rose-500 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 justify-end">
                <div className="text-right">
                  <p className="text-sm opacity-80 font-bold uppercase">Player 2</p>
                  <p className="text-2xl font-black">{player2?.displayName || 'Loading...'}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-user text-2xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Image Display */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-4 overflow-hidden">
              <img 
                src={round.imageUrl} 
                alt="Guess this!" 
                className="w-full h-auto rounded-2xl"
              />
            </div>

            {/* Guess Input for Participants */}
            {isParticipant && round.status === 'active' && (
              <form onSubmit={handleSubmitGuess} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-xl p-6">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    placeholder="Type your guess..."
                    className="flex-1 px-6 py-4 text-xl font-bold border-0 rounded-2xl focus:ring-4 focus:ring-white/50 outline-none"
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!guessInput.trim() || isSubmitting}
                    className="px-8 py-4 bg-white text-indigo-600 text-xl font-black rounded-2xl shadow-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                  >
                    {isSubmitting ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <><i className="fa-solid fa-paper-plane mr-2"></i> Submit</>
                    )}
                  </button>
                </div>
              </form>
            )}

            {!isParticipant && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
                <i className="fa-solid fa-eye text-amber-600 text-3xl mb-2"></i>
                <p className="text-amber-800 font-bold text-lg">You're watching this round</p>
                <p className="text-amber-600 text-sm">Only the two matched players can submit guesses</p>
              </div>
            )}
          </div>

          {/* Sidebar: Guesses & Host Controls */}
          <div className="space-y-6">
            {/* Live Guesses Feed */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-comments text-indigo-600"></i>
                Live Guesses
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {guesses.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fa-solid fa-hourglass-half text-slate-300 text-3xl mb-2"></i>
                    <p className="text-slate-400 font-medium">Waiting for guesses...</p>
                  </div>
                ) : (
                  guesses.map((guess) => (
                    <div
                      key={guess.id}
                      className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800">{guess.playerName}</p>
                          <p className="text-slate-600 mt-1">{guess.text}</p>
                        </div>
                        <p className="text-xs text-slate-400 whitespace-nowrap">
                          {new Date(guess.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Host Controls */}
            {isHost && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl shadow-xl p-6">
                <h3 className="text-xl font-black text-amber-900 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-crown"></i>
                  Host Controls
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-sm font-bold text-slate-600 mb-2">Correct Answer:</p>
                    <p className="text-xl font-black text-slate-800">{round.answer}</p>
                  </div>

                  <p className="text-xs text-amber-800 font-bold">Award Win:</p>
                  <button
                    onClick={() => handleHostOverride(round.playerIds[0])}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-trophy mr-2"></i>
                    {player1?.displayName} Wins
                  </button>
                  <button
                    onClick={() => handleHostOverride(round.playerIds[1])}
                    className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-trophy mr-2"></i>
                    {player2?.displayName} Wins
                  </button>

                  <button
                    onClick={handleCancelRound}
                    className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-ban mr-2"></i>
                    Cancel Round
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
