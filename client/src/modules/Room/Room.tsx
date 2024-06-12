import cn from "classnames";
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../../api/socket";
import { Canvas } from "../../shared/components/Canvas/Canvas";
import { Chat } from "../../shared/components/Chat/Chat";
import Toolbar from "../../shared/components/Toolbar/Toolbar";
import { Words } from "../../shared/components/Words/Words";
import { Room as IRoom, Player, Round } from "../../shared/models/roomModel";
import canvasState from "../../store/canvasState";

import "./Room.scss";
import { initialState } from "./const";
import { GlobalContext } from "../../GlobalContext";

export type RoomAction =
  | { type: "init"; value: IRoom }
  | { type: "updateUsers"; value: IRoom["players"] }
  | { type: "updateRound"; value: IRoom["round"] }
  | { type: "updateUserById"; value: Player };

function stateReducer(state: IRoom, action: RoomAction): IRoom {
  switch (action.type) {
    case "init":
      return action.value;
    case "updateUsers":
      return { ...state, players: action.value };
    case "updateRound": {
      return { ...state, round: action.value };
    }
    case "updateUserById": {
      const updatedPlayers = state.players
        .map((player) => {
          if (player.id === action.value.id) {
            return { ...player, ...action.value };
          }
          return player;
        })
        .sort((a, b) => b.score - a.score);
      return { ...state, players: updatedPlayers };
    }
  }
}

export const Room = () => {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const { name } = useContext(GlobalContext);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    socket.on("end-game", () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        setRemainingTime(0);
      }
    });

    socket.on("update-room", (room: IRoom) => {
      dispatch({ type: "init", value: room });
    });

    socket.on("start-round", (round: Round) => {
      canvasState.reset();
      dispatch({ type: "updateRound", value: round });
    });

    socket.on("users-update", (users: Player[]) => {
      dispatch({ type: "updateUsers", value: users });
    });

    socket.emit("join-room", id, name);
  }, [id, name]);

  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (!state.round.startTime) return;

    timerIntervalRef.current = setInterval(() => {
      const startTime = new Date(Number(state.round.startTime)).getTime();
      const currentTime = Date.now();
      const differenceInSeconds = Math.floor((currentTime - startTime) / 1000);
      setRemainingTime(state.roundTime - differenceInSeconds);
    }, 1000);

    return () => {
      clearInterval(timerIntervalRef.current);
    };
  }, [state.round, state.roundTime]);

  return (
    <>
      <div className="room">
        {state.competitive ? (
          <div className="info">
            <div className="info__round">
              Раунд {state.round.currentRound}/{state.maxRound}
            </div>
            <div className="info__time">
              {remainingTime
                ? `Оставшееся время: ${remainingTime}`
                : "Ожидаем других игроков..."}
            </div>
          </div>
        ) : null}
        <div className="box">
          <div className="players">
            <ul className="players__list">
              {state?.players.map((player) => (
                <li
                  className={cn("players__item", "player", {
                    player_me: player.id === socket.id,
                    player_drawer: state.round.painter?.id === player.id,
                  })}
                  key={player.name + player.score}
                >
                  <div className="player__avatar"></div>
                  <div className="player__info">
                    <div className="player__name">{player.name}</div>
                    <div className="player__score">{player.score}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Canvas />
          <div className="column">
            <Toolbar
              isActive={
                state.round.painter.id === socket.id || !state.competitive
              }
            />
            <Chat dispatch={dispatch} />
          </div>
        </div>
      </div>
      <Words painter={state.round.painter} />
    </>
  );
};
