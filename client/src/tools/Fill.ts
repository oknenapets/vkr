import { socket } from "../api/socket";
import Tool, { Tools } from "./Tool";
import { floodFill, getMousePosition, hexToRgba } from "./utils";

export default class Fill extends Tool {
  static draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: Uint8ClampedArray
  ) {
    floodFill(ctx, x, y, color);
  }

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.id = Tools.Fill;
    this.listen();
  }

  private listen() {
    this.canvas.onclick = this.mouseDownHandler.bind(this);
  }

  private mouseDownHandler(e: MouseEvent) {
    const { x, y } = getMousePosition(e, this.canvas);
    const color = hexToRgba(this.ctx.fillStyle as string);
    Fill.draw(this.ctx, x, y, color);

    socket.emit("paint", {
      method: "fill",
      shape: { x, y, color },
    });
    
  }
}
