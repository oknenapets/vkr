import { Word, IWord } from "../../schemes";
import { Player, Room, Round, CRoom } from "./types";

type RoundHandler = {
  painter: (theme: IWord[], roundInfo: Round) => void;
  startRound: (roundInfo: Round) => void;
  updateRoom: (room: CRoom) => void;
};

export class GameService {
  private rooms: Record<string, Room>;
  private timers: Record<
    string,
    { themeSelectTime?: NodeJS.Timeout; roundTime?: NodeJS.Timeout }
  >;
  constructor() {
    this.rooms = {};
    this.timers = {};
  }

  addPlayer(code: string, name: string, id: string): CRoom {
    const room = this.rooms[code];
    if (room) {
      room.players[id] = { name, id, score: 0 };
    }
    return this.prepareDataForClient(room);
  }

  removePlayerFromRoom(code: string, playerId: string): CRoom | null {
    const room = this.rooms[code];
    if (room && room.players[playerId]) {
      delete this.rooms[code].players[playerId];
    }
    const players = Object.values(room.players);
    if (!players.length) {
      delete this.rooms[code];
      this.clearTimers(code);
      return null;
    }
    return this.prepareDataForClient(this.rooms[code]);
  }

  async manageGame(
    code: string,
    roundHandler: RoundHandler,
    type: "connect" | "finish"
  ) {
    const { players, competitive, isStarted } = this.rooms[code];
    const numOfPlayers = Object.keys(players).length;

    if (!competitive || numOfPlayers >= 2) {
      this.startGame(code, roundHandler, type);
    } else if (numOfPlayers < 2 && isStarted) {
      this.stopGame(code);
    }
  }

  clearTimers(code: string) {
    const timer = this.timers[code];
    if (timer?.roundTime || timer?.themeSelectTime) {
      clearTimeout(timer.themeSelectTime);
      clearTimeout(timer.roundTime);
      this.timers[code] = {};
    }
  }

  getRoomInfo(code: string) {
    return this.rooms[code];
  }

  finisRound(code: string) {
    if (!this.rooms[code]) return;
    this.rooms[code].theme = null;
    this.rooms[code].round.guessed = [];
    this.rooms[code].round.currentRound++;
  }

  async startGame(
    code: string,
    roundHandler: RoundHandler,
    type: "connect" | "finish"
  ) {
    const startRound = async () => {
      const { round } = this.rooms[code];
      if (!this.rooms[code].competitive) return;
      if (this.rooms[code].round.currentRound > this.rooms[code].maxRound) {
        this.rooms[code].round.currentRound = 1;
        this.rooms[code].players = this.resetScores(this.rooms[code].players);
        roundHandler.updateRoom(this.prepareDataForClient(this.rooms[code]));
      }
      round.startTime = Date.now();

      this.rooms[code].round.painter = this.getRandomPlayer(code);

      let theme;
      if (this.rooms[code]?.category.length) {
        theme = await Word.aggregate<IWord>([
          { $match: { categories: { $in: this.rooms[code].category } } },
          { $sample: { size: 3 } },
        ]);
      } else {
        theme = await Word.find({}).limit(3);
      }
      roundHandler.startRound(round);
      roundHandler.painter && roundHandler.painter(theme!, round);

      this.timers[code] = {};
      const themeSelectTimer = setTimeout(() => {
        if (!this.rooms[code]?.theme && this.rooms[code]?.isStarted) {
          this.clearTimers(code);
          startRound();
        }
      }, this.rooms[code].themeSelectionTime * 1000);
      this.timers[code].themeSelectTime = themeSelectTimer;

      this.timers[code].themeSelectTime = this.timers[code].roundTime =
        setTimeout(() => {
          this.finisRound(code);
          startRound();
        }, this.rooms[code].roundTime * 1000);
    };

    if (this.rooms[code].isStarted && type === "finish") {
      this.clearTimers(code);
      this.finisRound(code);
      startRound();
    }
    if (!this.rooms[code].isStarted) {
      this.rooms[code].isStarted = true;
      startRound();
    }
  }

  stopGame(code: string): CRoom {
    const room = this.rooms[code];
    this.clearTimers(code);

    this.rooms[code] = {
      ...room,
      ...this.getDefaultState(),
      players: this.resetScores(room.players),
    };
    return this.prepareDataForClient(this.rooms[code]);
  }

  quickRoom(isCompetitive: boolean) {
    const rooms = Object.values(this.rooms);
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const players = Object.values(room.players);
      if (
        room.competitive &&
        players.length &&
        !room.private &&
        isCompetitive
      ) {
        return this.prepareDataForClient(room);
      }
    }
    return this.createRoom(isCompetitive);
  }

  resetScores(players: Record<string, Player>): Record<string, Player> {
    const updatedPlayers: Record<string, Player> = {};
    for (const playerId in players) {
      if (Object.prototype.hasOwnProperty.call(players, playerId)) {
        updatedPlayers[playerId] = {
          ...players[playerId],
          score: 0,
        };
      }
    }

    return updatedPlayers;
  }

  getRandomPlayer(code: string): Player {
    const playerValues = Object.values(this.rooms[code].players);
    const randomIndex = Math.floor(Math.random() * playerValues.length);
    return playerValues[randomIndex];
  }

  checkTheme(
    code: string,
    message: string,
    playerId: string
  ): { author: Player; players: Player[]; isComplete: boolean } | null {
    const room = this.rooms[code];
    const player = room.players[playerId];
    const painter = room.players[room.round.painter.id];
    const isGuessed = room.round.guessed.find((el) => el.id === player.id);

    if (player.id === room.round.painter.id) return null;

    if (message === room.theme?.value && !isGuessed) {
      const score = this.calculateScore(room.round.startTime);
      player.score += score || 0;
      painter.score += 100;
      room.round.guessed.push(player);
      const players = Object.values(room.players);
      const isComplete = room.round.guessed.length === players.length - 1;
      return { author: player, players, isComplete };
    }
    return null;
  }

  setTheme(code: string, theme: IWord) {
    this.rooms[code].theme = theme;
  }

  calculateScore(
    startTime: number,
    maxPoints: number = 100,
    currentTime: number = Date.now()
  ): number {
    const maxTime = (60 + 15) * 1000;
    const timeElapsed = currentTime - startTime;
    const timeRatio = Math.max(0, 1 - timeElapsed / maxTime);

    const points = Math.round(maxPoints * timeRatio);
    return points;
  }

  private prepareDataForClient(room: Room): CRoom {
    return {
      ...room,
      players: Object.values(room?.players),
      theme: null,
    };
  }

  async createRoom(
    isCompetitive = true,
    category: string = "",
    maxRound: number = 5,
    roundTime: number = 60,
    themeSelectTime: number = 5,
    isPrivate = false
  ) {
    const code = Date.now().toString();

    const room: Room = {
      ...this.getDefaultState(),
      code,
      roundTime: roundTime,
      themeSelectionTime: themeSelectTime,
      maxRound: maxRound,
      players: {},
      category: category.length ? [category] : [],
      competitive: isCompetitive,
      private: isPrivate,
    };
    this.rooms[code] = room;
    return room;
  }

  private getDefaultState() {
    return JSON.parse(
      JSON.stringify({
        competitive: true,
        theme: null,
        roundTime: 60,
        themeSelectionTime: 5,
        round: {
          currentRound: 1,
          painter: { id: "", name: "", score: 0 },
          startTime: 0,
          guessed: [],
        },
        isStarted: false,
      })
    );
  }

  getRooms() {
    return Object.values(this.rooms);
  }
}

export const gameService = new GameService();
