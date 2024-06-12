import { useContext, useEffect, useState } from "react";
import "./App.scss";
import { GlobalContext } from "./GlobalContext";
import avatar from "./assets/avatar.svg";
import { Modal } from "./shared/components/Modal/Modal";
import { categoryService } from "./api/services/categoryService";
import { roomService } from "./api/services/roomService";
import { useNavigate } from "react-router";

function App() {
  const { name, setName } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maxRound, setMaxRound] = useState(5);
  const [roundTime, setRoundTime] = useState(60);
  const [themeSelectTime, setThemeSelectTime] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isFreeDraw, setIsFreeDraw] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    const catData = await categoryService.getCategories();
    setCategories(catData.data);
    setSelectedCategory(catData.data[0]);
  };

  const createRoom = async () => {
    const data = await roomService.createRoom({
      isCompetitive: !isFreeDraw,
      category: selectedCategory,
      isPrivate,
      maxRound,
      roundTime,
      themeSelectTime,
    });
    if (data.data.code) navigate(`/room/${data.data.code}`);
  };

  const fastGame = async (isCompetitive) => {
    const data = await roomService.connectFreeDraw(isCompetitive);
    if (data.data.code) navigate(`/room/${data.data.code}`);
  };

  return (
    <main className="main">
      <div className="menu">
        <div className="menu__body">
          <div className="menu__row">
            <div className="menu__column">
              <div className="menu__avatar avatar">
                <div className="avatar__box">
                  <img src={avatar} alt="avatar" className="avatar__img" />
                </div>
              </div>
            </div>
            <div className="menu__column">
              <div className="menu__name">
                <label className="ui__label">
                  Псевдоним
                  <input
                    type="text"
                    className="ui__input"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value || Date.now().toString())
                    }
                  />
                </label>
              </div>
              <div className="menu__actions">
                <button
                  className="menu__action ui__button"
                  onClick={() => fastGame(!isFreeDraw)}
                >
                  Быстрая игра
                </button>
                <button
                  className="menu__action ui__button"
                  onClick={() => fastGame(isFreeDraw)}
                >
                  Свободное рисование
                </button>
                <button
                  className="menu__action ui__button"
                  onClick={() => setIsModalOpen(true)}
                >
                  Создать комнату
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <Modal>
          <div className="modal-room">
            <button onClick={() => setIsModalOpen(false)}>X</button>
            {!isFreeDraw && (
              <>
                <div className="row">
                  <label className="ui__label">
                    Максимальное количество раундов
                    <input
                      type="number"
                      value={maxRound}
                      onChange={(e) => setMaxRound(Number(e.target.value))}
                      className="ui__input"
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="ui__label">
                    Длительность раунда
                    <input
                      value={roundTime}
                      type="number"
                      className="ui__input"
                      onChange={(e) => setRoundTime(Number(e.target.value))}
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="ui__label">
                    Время выбора тема
                    <input
                      className="ui__input"
                      type="text"
                      value={themeSelectTime}
                      onChange={(e) =>
                        setThemeSelectTime(Number(e.target.value))
                      }
                    />
                  </label>
                </div>
              </>
            )}
            <div className="row">
              <label className="ui__label">
                Тема
                <select
                  className="ui__input"
                  name=""
                  id=""
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((el) => (
                    <option key={el._id} value={el._id}>
                      {el.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="row">
              <label className="ui__label">
                Приватная
                <input
                  className="ui__checkbox"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
              </label>
            </div>
            <div className="row">
              <label className="ui__label">
                Сводоное рисование
                <input
                  className="ui__checkbox"
                  type="checkbox"
                  checked={isFreeDraw}
                  onChange={(e) => {
                    setIsFreeDraw(e.target.checked);
                    setIsPrivate(true);
                  }}
                />
              </label>
            </div>
            <div className="row" onClick={() => createRoom()}>
              <button className="ui__button">Создать</button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}

export default App;
