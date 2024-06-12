import { Server as HttpServer } from "http";
import { CRoom, Player, Round, gameService } from "../services/GameService";
import { Server } from "socket.io";
import { IWord as Word } from "../schemes";
import {
  SocketEvents,
  ClientToServerEvents,
  ServerToClientEvents,
  Paint,
  Message,
  MessageTypes,
  SimpleMessage,
} from "./types";

interface SocketData {
  code: string | undefined;
}

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

  constructor(server: HttpServer) {
    ServerSocket.instance = this;
    this.io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
      pingInterval: 10000,
      pingTimeout: 5000,
      cors: {
        origin: "*",
      },
      connectionStateRecovery: {},
    });

    this.io.on("connect", async (socket) => {
      this.io.in(socket.id).emit(SocketEvents.RoomList, gameService.getRooms());

      socket.on(SocketEvents.RoomJoin, async (code: string, name: string) => {
        try {
          socket.data.code = code;
          socket.join(code);
          const room = gameService.addPlayer(code, name, socket.id);
          this.io.in(code).emit(SocketEvents.RoomUpdate, room);

          await gameService.manageGame(
            code,
            {
              painter: (theme: Word[], roundInfo: Round) =>
                this.io
                  .in(roundInfo.painter.id)
                  .emit(SocketEvents.Theme, theme),
              startRound: (roundInfo: Round) =>
                this.io.in(code).emit(SocketEvents.RoundStart, roundInfo),
              updateRoom: (room: CRoom) =>
                this.io.in(code).emit(SocketEvents.RoomUpdate, room),
            },
            "connect"
          );
        } catch (error) {
          console.error("Error in room join event:", error);
        }
      });

      socket.on("disconnect", async () => {
        try {
          const {
            id,
            data: { code },
          } = socket;
          if (!code) return;

          let room = gameService.removePlayerFromRoom(code, id);
          if (room && room.players.length < 2) {
            room = gameService.stopGame(code);
            this.io.in(code).emit(SocketEvents.GameEnd);
          }
          room && this.io.in(code).emit(SocketEvents.RoomUpdate, room);
        } catch (error) {
          console.error("Error in disconnect event:", error);
        }
      });

      socket.on(SocketEvents.Message, async (message: Message) => {
        try {
          const {
            id,
            data: { code },
          } = socket;
          if (!code) return;

          if (message.type === MessageTypes.ComplexMessage) {
            const result = gameService.checkTheme(code, message.value, id);
            if (result) {
              this.io.in(code).emit(SocketEvents.Message, {
                type: MessageTypes.SimpleMessage,
                author: result.author,
              });
              this.io.in(code).emit(SocketEvents.UpdateUsers, result.players);
              if (result.isComplete) {
                await gameService.manageGame(
                  code,
                  {
                    painter: (theme: Word[], roundInfo: Round) =>
                      this.io
                        .in(roundInfo.painter.id)
                        .emit(SocketEvents.Theme, theme),
                    startRound: (roundInfo: Round) =>
                      this.io.in(code).emit(SocketEvents.RoundStart, roundInfo),
                    updateRoom: (room: CRoom) =>
                      this.io.in(code).emit(SocketEvents.RoomUpdate, room),
                  },
                  "finish"
                );
              }
            } else {
              socket.to(code).emit(SocketEvents.Message, message);
            }
          }
        } catch (error) {
          console.error("Error in message event:", error);
        }
      });

      socket.on(SocketEvents.Theme, async (theme: Word) => {
        try {
          if (!socket.data.code) return;
          await gameService.setTheme(socket.data.code, theme);
        } catch (error) {
          console.error("Error in theme event:", error);
        }
      });

      socket.on(SocketEvents.Paint, (paint: Paint) => {
        if (!socket.data.code) return;
        socket.to(socket.data.code).emit(SocketEvents.Paint, paint);
      });

      socket.on(SocketEvents.RoomCreate, (code: string) => {
        gameService.createRoom();
        this.io.emit(SocketEvents.RoomList, gameService.getRooms());
      });
    });
  }
}
