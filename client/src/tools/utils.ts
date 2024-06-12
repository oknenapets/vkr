export type Color = Uint8ClampedArray;

export function getMousePosition(e: MouseEvent, canvas: HTMLCanvasElement) {
  const mouseX = ((e.offsetX * canvas.width) / canvas.clientWidth) | 0;
  const mouseY = ((e.offsetY * canvas.height) / canvas.clientHeight) | 0;
  return { x: mouseX, y: mouseY };
}

export function getPixel(imageData: ImageData, x: number, y: number) {
  if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
    return null;
  } else {
    const offset = (y * imageData.width + x) * 4;
    return imageData.data.slice(offset, offset + 4);
  }
}

export function setPixel(imageData: ImageData, x: number, y: number, color: Color) {
  const offset = (y * imageData.width + x) * 4;
  imageData.data[offset + 0] = color[0];
  imageData.data[offset + 1] = color[1];
  imageData.data[offset + 2] = color[2];
  imageData.data[offset + 3] = color[3];
}

export function hexToRgba(hex: string): Uint8ClampedArray {
  hex = hex.replace("#", "");

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return new Uint8ClampedArray([r, g, b, 255]);
}


export function floodFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillColor: Color
) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const targetColor = getPixel(imageData, x, y);

  if (!colorsMatch(targetColor, fillColor)) {
    const pixelsToCheck = [x, y];
    while (pixelsToCheck.length > 0) {
      const y = pixelsToCheck.pop();
      const x = pixelsToCheck.pop();

      const currentColor = getPixel(imageData, x, y);
      if (currentColor && colorsMatch(currentColor, targetColor)) {
        setPixel(imageData, x, y, fillColor);
        pixelsToCheck.push(x + 1, y);
        pixelsToCheck.push(x - 1, y);
        pixelsToCheck.push(x, y + 1);
        pixelsToCheck.push(x, y - 1);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}

export function colorsMatch(a: Color, b: Color): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
