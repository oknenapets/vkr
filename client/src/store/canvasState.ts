import { makeAutoObservable } from "mobx";

class CanvasState {
  canvas: HTMLCanvasElement = null;
  undoList = [];
  redoList = [];

  constructor() {
    makeAutoObservable(this);
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  reset() {
    this.clear();
    this.undoList = [];
    this.redoList = [];
  }

  clear() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  pushToUndo(data: string) {
    this.undoList.push(data);
  }

  undo() {
    const ctx: CanvasRenderingContext2D = this.canvas.getContext("2d");
    if (this.undoList.length > 0) {
      const dataUrl = this.undoList.pop();
      this.redoList.push(this.canvas.toDataURL());
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      };
    } else {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  redo() {
    const ctx = this.canvas.getContext("2d");
    if (this.redoList.length > 0) {
      const dataUrl = this.redoList.pop();
      this.undoList.push(this.canvas.toDataURL());
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      };
    }
  }
}

export default new CanvasState();
