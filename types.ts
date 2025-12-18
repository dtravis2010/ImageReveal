
export interface Team {
  id: 1 | 2;
  name: string;
  score: number;
  participants: string[];
  currentPlayerIndex: number;
}

export interface GameState {
  image: string | null;
  gridSize: number;
  revealedTiles: Set<number>;
  isAutoRevealing: boolean;
  score: number;
  timer: number;
  gameStatus: 'setup' | 'playing' | 'buzzed' | 'solved';
  difficulty: 'easy' | 'medium' | 'hard';
  teams: [Team, Team];
  activeTeamId: 1 | 2;
  buzzedByTeam: 1 | 2 | null;
}

export const DIFFICULTY_MAP = {
  easy: 4,
  medium: 6,
  hard: 10
};
