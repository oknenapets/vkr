export enum Tools {
  Brush = 1,
  Circle,
  Fill,
  Rect,
}

export default class Tool {
  public canvas: HTMLCanvasElement;
  public color: string;
  public ctx: CanvasRenderingContext2D;
  public id: number;
  public mouseDown: boolean;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.lineWidth = 3
    this.destroyEvents();
  }

  destroyEvents() {
    this.canvas.onmousemove = null;
    this.canvas.onmousedown = null;
    this.canvas.onmouseup = null;
    this.canvas.onclick = null;
  }

  set fillColor(color: string) {
    this.ctx.fillStyle = color;
  }

  set strokeColor(color: string) {
    this.ctx.strokeStyle = color;
  }

  set lineWidth(width: number) {
    this.ctx.lineWidth = width;
  }
}
