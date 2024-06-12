import Tool, { Tools } from "./Tool";
import { socket } from "../api/socket";
import { getMousePosition } from "./utils";
export default class Brush extends Tool {
  static draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    width: number
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.listen();
    this.mouseDown = false;
    this.id = Tools.Brush;
  }

  private listen() {
    this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
    this.canvas.onmousedown = this.mouseDownHandler.bind(this);
    this.canvas.onmouseup = this.mouseUpHandler.bind(this);
    this.canvas.ontouchmove = this.touchHadler.bind(this);
    this.canvas.ontouchend = this.touchEndHandler.bind(this);
    this.canvas.ontouchstart = this.touchStartHandler.bind(this);
  }

  private mouseDownHandler(e: MouseEvent) {
    const { x, y } = getMousePosition(e, this.canvas);
    socket.emit("paint", {
      method: "start",
      shape: { x, y, color: this.ctx.fillStyle },
    });
    this.mouseDown = true;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  private mouseMoveHandler(e: MouseEvent) {
    if (this.mouseDown) {
      const { x, y } = getMousePosition(e, this.canvas);

      Brush.draw(
        this.ctx,
        x,
        y,
        this.ctx.strokeStyle as string,
        this.ctx.lineWidth
      );
      //TODO socket event type
      socket.emit("paint", {
        method: "brush",
        shape: { x, y, color: this.ctx.fillStyle, width: this.ctx.lineWidth },
      });
    }
  }

  private mouseUpHandler() {
    this.mouseDown = false;
    this.ctx.beginPath();

    //TODO socket event type
    socket.emit("paint", {
      method: "finish",
      shape: { x: 0, y: 0, color: "" },
    });
  }

  private touchEndHandler() {
    this.mouseUpHandler();
  }

  private touchHadler(e: TouchEvent) {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    this.canvas.dispatchEvent(mouseEvent);
  }

  private touchStartHandler(e: TouchEvent) {
    e.preventDefault()
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    this.canvas.dispatchEvent(mouseEvent);
  }
}
