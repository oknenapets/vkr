import { Player, CRoom, Round } from "services/GameService";
import { IWord } from "schemes";

export enum DrawAction {
  Select = "select",
  Rectangle = "rectangle",
  Circle = "circle",
  Scribble = "freedraw",
  Arrow = "arrow",
}

export interface Paint {
  method: DrawAction;
  shape: Shape;
  color: string;
}

export type Shape = {
  color: string;
  x?: number;
  y?: number;
};

export enum SocketEvents {
  RoomCreate = "create-room",
  RoomList = "get-rooms",
  RoomJoin = "join-room",
  RoomLeave = "leave-room",
  RoomUpdate = "update-room",
  Message = "message",
  Theme = "theme",
  RoundStart = "start-round",
  GameEnd = "end-game",
  UpdateUsers = "users-update",
  Paint = "paint",
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

export interface ServerToClientEvents {
  [SocketEvents.RoomUpdate]: (room: CRoom) => void;
  [SocketEvents.Message]: (message: Message) => void;
  [SocketEvents.Theme]: (theme: IWord[]) => void;
  [SocketEvents.RoundStart]: (roundInfo: Round) => void;
  [SocketEvents.GameEnd]: () => void;
  [SocketEvents.UpdateUsers]: (users: Player[]) => void;
  [SocketEvents.Paint]: (data: Paint) => void;
  [SocketEvents.RoomList]: (data: any) => void;
}

export interface ClientToServerEvents {
  [SocketEvents.RoomJoin]: (code: string, name: string) => void;
  [SocketEvents.Message]: (message: Message) => void;
  [SocketEvents.Theme]: (theme: IWord) => void;
  [SocketEvents.Paint]: (data: Paint) => void;
  [SocketEvents.RoomCreate]: (code: string) => void;
}
