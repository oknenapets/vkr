import { memo, useEffect, useState } from "react";
import { Player, Word } from "../../models/roomModel";
import { Modal } from "../Modal/Modal";
import { socket } from "../../../api/socket";

export const Words = memo(({ painter }: { painter: Player }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [themes, setThemes] = useState<Word[]>([]);

  const onChooseWord = (theme: Word) => {
    setIsModalOpen(false);
    socket.emit("theme", theme);
  };

  useEffect(() => {
    socket.on("theme", (theme: Word[]) => {
      setThemes(theme);
      setIsModalOpen(true);
    });
  }, []);

  useEffect(() => {
    if (painter?.id === socket.id && themes.length) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [painter.id, themes]);

  return isModalOpen ? (
    <Modal>
      <div className="modal-chose">
        {themes.map((theme) => (
          <button
            className="modal-chose__word ui__button"
            onClick={() => onChooseWord(theme)}
            key={theme.value}
          >
            {theme.value}
          </button>
        ))}
      </div>
    </Modal>
  ) : null;
});
