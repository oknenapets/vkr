import { IWord } from "schemes";

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Round {
  guessed: Player[];
  currentRound: number;
  painter: Player;
  startTime: number;
}

export interface Room {
  roundTime: number;
  themeSelectionTime: number;
  code: string;
  players: Record<string, Player>;
  theme: IWord | null;
  round: Round;
  isStarted: boolean;
  maxRound: number;
  category: string[];
  competitive: boolean;
  private: boolean;
}

export interface CRoom extends Omit<Room, "players"> {
  players: Player[];
}
