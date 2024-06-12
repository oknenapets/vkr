import { socket } from "../api/socket";
import Tool, { Tools } from "./Tool";
import { getMousePosition } from "./utils";

export default class Circle extends Tool {
  static paint(
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    r: number,
    color: string,
    width: number
  ) {
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
  }

  private saved: string;
  public r: number;
  public startX: number;
  public startY: number;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.listen();
    this.id = Tools.Circle;
  }

  private draw(x: number, y: number, r: number, width: number) {
    const img = new Image();
    img.src = this.saved;
    img.onload = async function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.lineWidth = width;
      this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    }.bind(this);
  }

  private listen() {
    this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
    this.canvas.onmousedown = this.mouseDownHandler.bind(this);
    this.canvas.onmouseup = this.mouseUpHandler.bind(this);
    this.canvas.ontouchend = this.mouseUpHandler.bind(this);
  }

  private mouseDownHandler(e: MouseEvent) {
    this.mouseDown = true;
    const canvasData = this.canvas.toDataURL();
    this.ctx.beginPath();
    const { x, y } = getMousePosition(e, this.canvas);
    this.startX = x;
    this.startY = y;
    this.saved = canvasData;
  }

  private mouseMoveHandler(e: MouseEvent) {
    if (this.mouseDown) {
      const { x, y } = getMousePosition(e, this.canvas);
      const width = x - this.startX;
      const height = y - this.startY;
      this.r = Math.sqrt(width ** 2 + height ** 2);
      this.draw(this.startX, this.startY, this.r, this.lineWidth);
    }
  }

  private mouseUpHandler() {
    this.mouseDown = false;
    //TODO socket event type
    socket.emit("paint", {
      method: "circle",
      shape: {
        x: this.startX,
        y: this.startY,
        r: this.r,
        color: this.ctx.fillStyle,
        width: this.ctx.lineWidth,
      },
    });
  }

  private touchStartHandler(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    this.canvas.dispatchEvent(mouseEvent);
  }
}
