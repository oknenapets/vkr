import { Room } from "../../shared/models/roomModel";

export const initialState: Room = {
  code: "",
  players: [],
  round: {
    currentRound: 1,
    painter: { id: "", name: "", score: 0 },
    startTime: 0,
  },
  settings: {
    maxPlayers: 5,
    maxRound: 3,
  },
};
