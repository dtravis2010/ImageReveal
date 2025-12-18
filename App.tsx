import React, { useState, useEffect } from 'react';
import { onAuthChange, getCurrentUser, getUser, subscribeToActiveRound, updateSettings, getSettings, subscribeToUsers, generateEventId } from './firebaseService';
import { User, Round } from './gameTypes';
import { LoginView } from './components/LoginView';
import { LobbyView } from './components/LobbyView';
import { HostPanel } from './components/HostPanel';
import { RoundView } from './components/RoundView';
import { ScoreboardView } from './components/ScoreboardView';

type AppView = 'login' | 'lobby' | 'host-panel' | 'round' | 'scoreboard';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [eventId, setEventId] = useState<string>('');
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<[string, string] | null>(null);

  // Initialize auth and event
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const user = await getUser(firebaseUser.uid);
        if (user && user.displayName) {
          setCurrentUserId(firebaseUser.uid);
          setCurrentUser(user);
          setIsHost(user.isHost);
          setView('lobby');
        }
      } else {
        setView('login');
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize or get event ID
  useEffect(() => {
    const initializeEvent = async () => {
      const settings = await getSettings();
      if (settings && settings.currentEventId) {
        setEventId(settings.currentEventId);
      } else {
        const newEventId = generateEventId();
        setEventId(newEventId);
        await updateSettings({ currentEventId: newEventId, isPaused: false, allowSpectators: true, hostUserId: '' });
      }
    };

    if (currentUserId) {
      initializeEvent();
    }
  }, [currentUserId]);

  // Subscribe to active round
  useEffect(() => {
    if (currentUserId && view !== 'login') {
      const unsubscribe = subscribeToActiveRound((round) => {
        setActiveRound(round);
        if (round && round.status === 'active' && view === 'lobby') {
          setView('round');
        } else if (!round && view === 'round') {
          setView('lobby');
        }
      });

      return () => unsubscribe();
    }
  }, [currentUserId, view]);

  // Subscribe to users
  useEffect(() => {
    if (currentUserId && view !== 'login') {
      const unsubscribe = subscribeToUsers(setUsers);
      return () => unsubscribe();
    }
  }, [currentUserId, view]);

  const handleLoginComplete = (userId: string, isHostUser: boolean) => {
    setCurrentUserId(userId);
    setIsHost(isHostUser);
    setView('lobby');
  };

  const handleStartMatch = (player1Id: string, player2Id: string) => {
    setSelectedPlayers([player1Id, player2Id]);
    setView('host-panel');
  };

  const handleRoundStarted = (roundId: string) => {
    setSelectedPlayers(null);
    setView('round');
  };

  const handleCancelHostPanel = () => {
    setSelectedPlayers(null);
    setView('lobby');
  };

  const handleRoundEnd = () => {
    setView('lobby');
  };

  const handleGoToScoreboard = () => {
    setView('scoreboard');
  };

  const handleBackToLobby = () => {
    setView('lobby');
  };

  // Loading state
  if (view === 'login') {
    return <LoginView onLoginComplete={handleLoginComplete} />;
  }

  if (!currentUserId || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
          <p className="text-lg font-bold text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render based on current view
  switch (view) {
    case 'lobby':
      return (
        <LobbyView
          currentUserId={currentUserId}
          isHost={isHost}
          onStartMatch={handleStartMatch}
          onGoToScoreboard={handleGoToScoreboard}
        />
      );

    case 'host-panel':
      if (!selectedPlayers) {
        setView('lobby');
        return null;
      }
      const player1 = users.find(u => u.id === selectedPlayers[0]);
      const player2 = users.find(u => u.id === selectedPlayers[1]);
      return (
        <HostPanel
          hostUserId={currentUserId}
          player1Id={selectedPlayers[0]}
          player2Id={selectedPlayers[1]}
          player1Name={player1?.displayName || 'Player 1'}
          player2Name={player2?.displayName || 'Player 2'}
          onRoundStarted={handleRoundStarted}
          onCancel={handleCancelHostPanel}
        />
      );

    case 'round':
      if (!activeRound) {
        setView('lobby');
        return null;
      }
      return (
        <RoundView
          round={activeRound}
          currentUserId={currentUserId}
          currentUserName={currentUser.displayName}
          isHost={isHost}
          eventId={eventId}
          users={users}
          onRoundEnd={handleRoundEnd}
        />
      );

    case 'scoreboard':
      return (
        <ScoreboardView
          eventId={eventId}
          users={users}
          isHost={isHost}
          onBackToLobby={handleBackToLobby}
        />
      );

    default:
      return null;
  }
};

export default App;
