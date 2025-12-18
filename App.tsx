
import React, { useState, useEffect, useRef } from 'react';
import { GameState, DIFFICULTY_MAP, Team } from './types';
import { Header } from './components/Header';
import { SetupScreen } from './components/SetupScreen';
import { GameBoard } from './components/GameBoard';
import { ScoreBoard } from './components/ScoreBoard';
import { ShareModal } from './components/ShareModal';
import { generateRoomId, syncGameState, subscribeToRoom } from './firebaseService';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    image: null,
    gridSize: DIFFICULTY_MAP.medium,
    revealedTiles: new Set(),
    isAutoRevealing: false,
    score: 1000,
    timer: 0,
    gameStatus: 'setup',
    difficulty: 'medium',
    activeTeamId: 1,
    buzzedByTeam: null,
    teams: [
      { id: 1, name: 'Team One', score: 0, participants: [], currentPlayerIndex: 0 },
      { id: 2, name: 'Team Two', score: 0, participants: [], currentPlayerIndex: 0 }
    ]
  });

  const [roomId, setRoomId] = useState<string | null>(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [claimedTeam, setClaimedTeam] = useState<1 | 2 | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const autoRevealTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setRoomId(room);
      setIsSpectator(true);
      setIsConnecting(true);
      const unsubscribe = subscribeToRoom(room, (remoteState) => {
        setState(prev => ({ ...prev, ...remoteState }));
        setIsConnecting(false);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (state.gameStatus === 'playing' && state.isAutoRevealing && !isSpectator) {
      autoRevealTimer.current = setInterval(() => {
        setState(prev => {
          const unrevealed = [];
          for (let i = 0; i < prev.gridSize * prev.gridSize; i++) {
            if (!prev.revealedTiles.has(i)) unrevealed.push(i);
          }
          
          if (unrevealed.length === 0) {
            if (autoRevealTimer.current) clearInterval(autoRevealTimer.current);
            return prev;
          }

          const nextTiles = new Set(prev.revealedTiles);
          nextTiles.add(unrevealed[Math.floor(Math.random() * unrevealed.length)]);
          
          const newState = { 
            ...prev, 
            revealedTiles: nextTiles,
            score: Math.max(100, prev.score - 5) 
          };
          if (roomId) syncGameState(roomId, newState);
          return newState;
        });
      }, 1000);
    } else {
      if (autoRevealTimer.current) clearInterval(autoRevealTimer.current);
    }
    return () => { if (autoRevealTimer.current) clearInterval(autoRevealTimer.current); };
  }, [state.gameStatus, state.isAutoRevealing, isSpectator, roomId]);

  const handleStartGame = (image: string, difficulty: 'easy' | 'medium' | 'hard', teamConfig: any) => {
    const newRoomId = roomId || generateRoomId();
    if (!roomId) setRoomId(newRoomId);
    
    const initialState: GameState = {
      image,
      difficulty,
      gridSize: DIFFICULTY_MAP[difficulty],
      revealedTiles: new Set(),
      isAutoRevealing: false,
      score: 1000,
      timer: 0,
      gameStatus: 'playing',
      activeTeamId: 1,
      buzzedByTeam: null,
      teams: [
        { 
          id: 1, 
          name: teamConfig?.t1?.name || state.teams[0].name, 
          score: state.teams[0].score,
          participants: teamConfig?.t1?.players || [],
          currentPlayerIndex: 0
        },
        { 
          id: 2, 
          name: teamConfig?.t2?.name || state.teams[1].name, 
          score: state.teams[1].score,
          participants: teamConfig?.t2?.players || [],
          currentPlayerIndex: 0
        }
      ]
    };

    setState(initialState);
    syncGameState(newRoomId, initialState);
  };

  const handleBuzz = (teamId: 1 | 2) => {
    if (state.gameStatus !== 'playing') return;
    const newState = { ...state, gameStatus: 'buzzed' as const, buzzedByTeam: teamId, isAutoRevealing: false };
    setState(newState);
    if (roomId) syncGameState(roomId, newState);
  };

  const handleAdjudicate = (isCorrect: boolean) => {
    if (state.gameStatus !== 'buzzed' || !state.buzzedByTeam) return;
    
    if (isCorrect) {
      const updatedTeams = [...state.teams] as [Team, Team];
      const activeIdx = state.buzzedByTeam - 1;
      updatedTeams[activeIdx].score += state.score;
      
      if (updatedTeams[activeIdx].participants.length > 0) {
        updatedTeams[activeIdx].currentPlayerIndex = 
          (updatedTeams[activeIdx].currentPlayerIndex + 1) % updatedTeams[activeIdx].participants.length;
      }

      const totalTiles = state.gridSize * state.gridSize;
      const all = new Set<number>();
      for (let i = 0; i < totalTiles; i++) all.add(i);

      const newState = { ...state, teams: updatedTeams, gameStatus: 'solved' as const, revealedTiles: all };
      setState(newState);
      if (roomId) syncGameState(roomId, newState);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } else {
      const newState = { ...state, gameStatus: 'playing' as const, buzzedByTeam: null, isAutoRevealing: true };
      setState(newState);
      if (roomId) syncGameState(roomId, newState);
    }
  };

  const toggleAutoReveal = () => {
    const newState = { ...state, isAutoRevealing: !state.isAutoRevealing };
    setState(newState);
    if (roomId) syncGameState(roomId, newState);
  };

  const handleReset = () => {
    if (isSpectator) {
      window.location.href = window.location.pathname;
      return;
    }
    const newState = { ...state, gameStatus: 'setup' as const, image: null, buzzedByTeam: null, isAutoRevealing: false };
    setState(newState);
    if (roomId) syncGameState(roomId, newState);
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-indigo-500"></i>
        <p className="font-bold animate-pulse">Connecting to Arena...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
      {!isSpectator && <Header />}

      {roomId && (
        <div className="mt-4 flex items-center gap-4 bg-white px-6 py-2 rounded-full shadow-lg border border-indigo-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Room: {roomId}</span>
          </div>
          {!isSpectator && (
            <button onClick={() => setShowShareModal(true)} className="text-indigo-600 hover:scale-110 transition-transform">
              <i className="fa-solid fa-qrcode"></i>
            </button>
          )}
        </div>
      )}

      <main className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden mt-6 border-4 border-white p-2">
        {state.gameStatus === 'setup' && !isSpectator ? (
          <SetupScreen onStart={handleStartGame} />
        ) : isSpectator && state.gameStatus === 'setup' ? (
          <div className="p-24 text-center space-y-6">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
               <i className="fa-solid fa-hourglass-start text-4xl text-indigo-200 animate-spin-slow"></i>
            </div>
            <div>
               <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ready for Battle?</h2>
               <p className="text-slate-500 font-medium">Waiting for the host to start the round...</p>
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-8">
            <ScoreBoard teams={state.teams} activeTeamId={state.buzzedByTeam || 1} roundScore={state.score} />

            <div className="grid md:grid-cols-[1fr,320px] gap-8">
              <div className="relative">
                <GameBoard 
                  image={state.image || ''} 
                  gridSize={state.gridSize} 
                  revealedTiles={state.revealedTiles}
                  onTileClick={() => {}} 
                  isSolved={state.gameStatus === 'solved'}
                />

                {state.gameStatus === 'buzzed' && (
                  <div className="absolute inset-0 bg-rose-600/90 backdrop-blur-md flex flex-col items-center justify-center animate-in zoom-in duration-300 rounded-xl text-white z-[40]">
                    <div className="bg-white text-rose-600 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                      <i className="fa-solid fa-bell text-4xl"></i>
                    </div>
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-2">BUZZED!</h2>
                    <p className="text-xl font-bold opacity-90">{state.teams[(state.buzzedByTeam || 1) - 1].name} is answering...</p>
                    
                    {!isSpectator && (
                      <div className="mt-10 flex gap-6">
                        <button onClick={() => handleAdjudicate(true)} className="px-10 py-5 bg-green-500 text-white rounded-2xl font-black shadow-2xl hover:bg-green-400 transition-all border-b-4 border-green-700">CORRECT</button>
                        <button onClick={() => handleAdjudicate(false)} className="px-10 py-5 bg-slate-800 text-white rounded-2xl font-black shadow-2xl hover:bg-slate-700 transition-all border-b-4 border-slate-950">INCORRECT</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-slate-900 text-white p-8 rounded-[2rem] text-center shadow-2xl border-b-8 border-slate-950">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Pot Value</p>
                  <p className="text-6xl font-black font-mono text-yellow-400 tracking-tighter">{state.score}</p>
                </div>

                {!isSpectator ? (
                  <div className="space-y-4">
                    <button 
                      onClick={toggleAutoReveal}
                      disabled={state.gameStatus !== 'playing'}
                      className={`w-full py-7 rounded-3xl font-black text-2xl transition-all shadow-xl border-b-8 ${state.isAutoRevealing ? 'bg-rose-500 border-rose-700 text-white' : 'bg-indigo-600 border-indigo-800 text-white hover:bg-indigo-500 active:border-b-4 active:translate-y-1'}`}
                    >
                      {state.isAutoRevealing ? 'STOP REVEAL' : 'START REVEAL'}
                    </button>
                    <button onClick={handleReset} className="w-full py-4 border-2 border-slate-200 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-colors">NEW ROUND</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!claimedTeam ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setClaimedTeam(1)} className="p-8 bg-rose-50 text-rose-600 rounded-[2rem] font-black border-2 border-rose-200 hover:bg-rose-100 transition-all shadow-sm">Claim Team 1</button>
                        <button onClick={() => setClaimedTeam(2)} className="p-8 bg-blue-50 text-blue-600 rounded-[2rem] font-black border-2 border-blue-200 hover:bg-blue-100 transition-all shadow-sm">Claim Team 2</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleBuzz(claimedTeam)}
                        disabled={state.gameStatus !== 'playing'}
                        className={`w-full h-64 rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center transition-all active:scale-95 active:border-b-4 disabled:grayscale disabled:opacity-50 border-b-8 ${claimedTeam === 1 ? 'bg-rose-600 border-rose-800 shadow-rose-200' : 'bg-blue-600 border-blue-800 shadow-blue-200'} text-white`}
                      >
                        <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                           <i className="fa-solid fa-hand-pointer text-5xl"></i>
                        </div>
                        <span className="text-4xl font-black italic tracking-tighter">BUZZ IN!</span>
                        <p className="text-xs font-bold mt-4 uppercase tracking-widest opacity-70">Team: {state.teams[claimedTeam-1].name}</p>
                      </button>
                    )}
                    <button onClick={handleReset} className="w-full py-3 text-slate-400 text-xs font-bold">Leave Room</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {showShareModal && roomId && <ShareModal roomId={roomId} onClose={() => setShowShareModal(false)} />}
    </div>
  );
};

export default App;
