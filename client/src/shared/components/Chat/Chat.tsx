import {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { socket } from "../../../api/socket";
import { Message, MessageTypes } from "../../models/roomModel";
import { RoomAction } from "../../../modules/Room";
import { GlobalContext } from "../../../GlobalContext";

export const Chat = ({ dispatch }: { dispatch: Dispatch<RoomAction> }) => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesListRef = useRef<HTMLUListElement | null>(null);
  const { name } = useContext(GlobalContext);

  const sendMessage = useCallback(() => {
    if (!text) return;
    const message = {
      type: MessageTypes.ComplexMessage,
      value: text,
      author: { name, score: 0, id: socket.id },
    };
    socket.emit("message", message);
    setMessages((prev) => [...prev, message]);
    setText("");
  }, [name, text]);

  useEffect(() => {
    if (!socket.hasListeners("message")) {
      socket.on("message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });
    }

    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [sendMessage, dispatch]);

  useEffect(() => {
    if (!messagesListRef.current) return;
    messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="chat">
      <ul className="chat__list" ref={messagesListRef}>
        {messages.map((message, idx) => (
          <li className="message" key={idx}>
            {message.type === MessageTypes.SimpleMessage && (
              <span className="message__data message__data_success">
                {message.author.name} угадал слово
              </span>
            )}
            {message.type === MessageTypes.ComplexMessage && (
              <>
                <span className="message__author">{message.author.name}:</span>
                <span className="message__data">{message.value}</span>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="chat__panel">
        <input
          className="chat__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={sendMessage}>отправить</button>
      </div>
    </div>
  );
};
