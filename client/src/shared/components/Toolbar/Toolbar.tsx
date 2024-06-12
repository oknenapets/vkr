import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect } from "react";
import { socket } from "../../../api/socket";
import canvasState from "../../../store/canvasState";
import toolState from "../../../store/toolState";
import Brush from "../../../tools/Brush";
import Circle from "../../../tools/Circle";
import Fill from "../../../tools/Fill";
import Rect from "../../../tools/Rect";
import { Tools } from "../../../tools/Tool";

import "./toolbar.scss";

export const Toolbar = observer(({ isActive }: { isActive: boolean }) => {
  useEffect(() => {
    if (!isActive) {
      toolState.tool?.destroyEvents();
      toolState.setTool(null);
    } else {
      toolState.setTool(new Brush(canvasState.canvas));
    }
  }, [isActive]);

  const changeColor = (e: ChangeEvent<HTMLInputElement>) => {
    toolState.setStrokeColor(e.target.value);
    toolState.setFillColor(e.target.value);
  };

  const changeWidth = (e: ChangeEvent<HTMLInputElement>) => {
    toolState.setLineWidth(Number(e.target.value));
  };

  const undo = () => {
    canvasState.undo();
    socket.emit("paint", {
      method: "undo",
    });
  };

  const redo = () => {
    canvasState.redo();
    socket.emit("paint", {
      method: "redo",
    });
  };

  const clear = () => {
    canvasState.clear();
    socket.emit("paint", {
      method: "clear",
    });
  };

  return (
    <div className="toolbar">
      {isActive ? (
        <>
          <div
            className={classNames("toolbar__item", {
              toolbar__item_active: toolState.tool?.id === Tools.Brush,
            })}
          >
            <button
              className="toolbar__btn brush"
              onClick={() => toolState.setTool(new Brush(canvasState.canvas))}
            />
          </div>
          <div
            className={classNames("toolbar__item", {
              toolbar__item_active: toolState.tool?.id === Tools.Rect,
            })}
          >
            <button
              className="toolbar__btn rect"
              onClick={() => toolState.setTool(new Rect(canvasState.canvas))}
            />
          </div>
          <div
            className={classNames("toolbar__item", {
              toolbar__item_active: toolState.tool?.id === Tools.Circle,
            })}
          >
            <button
              className="toolbar__btn circle"
              onClick={() => toolState.setTool(new Circle(canvasState.canvas))}
            />
          </div>
          <div
            className={classNames("toolbar__item", {
              toolbar__item_active: toolState.tool?.id === Tools.Fill,
            })}
          >
            <button
              className="toolbar__btn fill"
              onClick={() => toolState.setTool(new Fill(canvasState.canvas))}
            />
          </div>
          <div className="toolbar__item">
            <input
              className="toolbar_btn color"
              onChange={(e) => changeColor(e)}
              defaultValue={"black"}
              type="color"
            />
          </div>
          <div className="toolbar__item">
            <button className="toolbar__btn trash" onClick={clear} />
          </div>
          <div className="toolbar__item">
            <button className="toolbar__btn undo" onClick={undo} />
          </div>
          <div className="toolbar__item">
            <button className="toolbar__btn redo" onClick={redo} />
          </div>
          <div className="toolbar__item_range">
            <label>
              Толщина
              <input
                type="range"
                className="toolbar__thick"
                onChange={changeWidth}
                min={2}
                max={10}
                defaultValue={3}
              />
            </label>
          </div>
        </>
      ) : null}
    </div>
  );
});

export default Toolbar;
