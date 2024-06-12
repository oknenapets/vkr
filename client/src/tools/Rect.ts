import { socket } from "../api/socket";
import Tool, { Tools } from "./Tool";
import { getMousePosition } from "./utils";

export default class Rect extends Tool {
  static paint(
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    width: number
  ) {
    const ctx = canvas.getContext("2d");
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.beginPath();
  }

  private saved: string;
  public height: number;
  public startX: number;
  public startY: number;
  public width: number;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.id = Tools.Rect;
    this.listen();
  }

  private draw(x: number, y: number, w: number, h: number) {
    const img = new Image();
    img.src = this.saved;
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
      this.ctx.rect(x, y, w, h);
      this.ctx.stroke();
    };
  }

  private listen() {
    this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
    this.canvas.onmousedown = this.mouseDownHandler.bind(this);
    this.canvas.onmouseup = this.mouseUpHandler.bind(this);
    this.canvas.ontouchend = this.mouseUpHandler.bind(this);
  }

  private mouseDownHandler(e: MouseEvent) {
    this.mouseDown = true;
    const { x, y } = getMousePosition(e, this.canvas);
    this.startX = x;
    this.startY = y;
    this.ctx.beginPath();
    this.saved = this.canvas.toDataURL();
  }

  private mouseMoveHandler(e: MouseEvent) {
    if (this.mouseDown) {
      const { x, y } = getMousePosition(e, this.canvas);
      this.width = x - this.startX;
      this.height = y - this.startY;
      this.draw(this.startX, this.startY, this.width, this.height);
    }
  }

  private mouseUpHandler() {
    this.mouseDown = false;
    //TODO socket event type
    socket.emit("paint", {
      method: "rect",
      shape: {
        x: this.startX,
        y: this.startY,
        h: this.height,
        w: this.width,
        color: this.ctx.fillStyle,
        width: this.ctx.lineWidth,
      },
    });
  }
}
