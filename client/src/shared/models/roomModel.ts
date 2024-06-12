export interface Player {
  name: string;
  id: string;
  score: number;
}

export interface Round {
  currentRound: number;
  painter: Player;
  startTime: number;
}

export interface Room {
  code: string;
  players: Player[];
  round: Round;
  maxRound: number;
  roundTime: number;
  competitive: boolean;
  themeSelectionTime: number;
}

export enum MessageTypes {
  SimpleMessage = "TypeOnly",
  ComplexMessage = "WithValueAndAuthor",
}

export interface SimpleMessage {
  type: MessageTypes.SimpleMessage;
  author: Readonly<Player>;
}

export interface ComplexMessage {
  type: MessageTypes.ComplexMessage;
  value: string;
  author: Readonly<Player>;
}

export type Message = SimpleMessage | ComplexMessage;

export interface Word {
  value: string;
  category: string;
  language: string;
}
