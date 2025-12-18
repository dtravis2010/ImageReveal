// Image Guess Duel Game Types

export type PlayerStatus = 'available' | 'in_match';
export type RoundStatus = 'pending' | 'active' | 'ended';
export type AuthProvider = 'anonymous' | 'email';

export interface User {
  id: string;
  displayName: string;
  authProvider: AuthProvider;
  status: PlayerStatus;
  isHost: boolean;
  createdAt: number;
}

export interface Round {
  id: string;
  status: RoundStatus;
  imageUrl: string;
  answer: string;
  playerIds: [string, string];
  winnerId: string | null;
  startedAt: number | null;
  endedAt: number | null;
  createdBy: string;
}

export interface Guess {
  id: string;
  roundId: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
  isCorrect: boolean;
}

export interface PlayerScore {
  wins: number;
  plays: number;
  fastestMs: number | null;
}

export interface Scoreboard {
  eventId: string;
  totals: Record<string, PlayerScore>;
  updatedAt: number;
}

export interface GameSettings {
  currentEventId: string;
  isPaused: boolean;
  allowSpectators: boolean;
  hostUserId: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  uploadedBy: string;
  uploadedAt: number;
  name: string;
}
