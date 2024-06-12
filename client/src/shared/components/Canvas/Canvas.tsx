import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { socket } from "../../../api/socket";
import canvasState from "../../../store/canvasState";
import Brush from "../../../tools/Brush";

import Circle from "../../../tools/Circle";
import Fill from "../../../tools/Fill";
import Rect from "../../../tools/Rect";

import "./canvas.scss";

export const Canvas = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    socket.on("paint", (data) => drawHandler(data));
  }, [socket]);

  useEffect(() => canvasState.setCanvas(canvasRef.current), []);

  const pushToUndo = () => {
    canvasState.pushToUndo(canvasRef.current.toDataURL());
  };

  const mouseDownHandler = () => {
    pushToUndo();
  };

  const drawHandler = (msg) => {
    const { shape, method } = msg;
    const ctx = canvasRef.current.getContext("2d");

    const drawingMethods = {
      brush: () => {
        const { x, y, color, width } = shape;
        Brush.draw(ctx, x, y, color, width);
      },
      fill: () => {
        pushToUndo();
        const { x, y, color } = shape;
        Fill.draw(ctx, x, y, new Uint8ClampedArray(color));
      },
      circle: () => {
        pushToUndo();
        const { x, y, r, color, width } = shape;
        Circle.paint(canvasRef.current, x, y, r, color, width);
      },
      rect: () => {
        pushToUndo();
        const { x, y, w, h, color, width } = shape;
        Rect.paint(canvasRef.current, x, y, w, h, color, width);
      },
      start: () => {
        pushToUndo();
      },
      finish: () => {
        ctx.beginPath();
      },
      clear: () => {
        canvasState.clear();
      },
      undo: () => {
        canvasState.undo();
      },
      redo: () => {
        canvasState.redo();
      },
    };

    if (drawingMethods[method]) {
      drawingMethods[method]();
    } else {
      console.warn(`Unknown method: ${method}`);
    }
  };

  return (
    <div className="canvas">
      <canvas
        onMouseDown={() => mouseDownHandler()}
        onTouchStart={() => mouseDownHandler()}
        ref={canvasRef}
        width={800}
        height={780}
      />
    </div>
  );
});
