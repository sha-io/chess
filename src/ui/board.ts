import ChessCanvas from "./canvas";
import { floor } from "../utils/math";

export default class ChessBoard extends ChessCanvas {
  colorScheme: { w: string; b: string } = {
    w: "rgb(227,193,111)",
    b: "rgb(184,139,74)",
  };
  font: string = 'Poppins'
  files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

  constructor(w: number, h: number) {
    super(w, h);
    this.id = 'chess-board'
  }

  set theme(theme: { w: string; b: string }) {
    this.colorScheme = theme
  }

  get fontSize() {
    return this.boxSize / 4
  }

  drawText(text: string, colour: string, x: number, y: number, weight: number = 500, font: string = this.font, size: number = this.fontSize) {
    this.ctx.font = `${weight} ${size}px ${font}`
    this.ctx.fillStyle = colour
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(text, x, y);
  }

  drawRanks() {
    let { w, b } = this.colorScheme
    for (let row = 0; row < 8; row++) {
      let color = (row) % 2 == 0 ? b : w;
      let text = `${8 - row}`
      const padding = this.fontSize * .35
      this.drawText(text, color, 0 + padding, this.fontSize + (this.boxSize * row) + padding)
    }
  }

  drawFiles() {
    let { w, b } = this.colorScheme
    for (let row = 0; row < 8; row++) {
      let text = `${this.files[row]}`
      let color = (row) % 2 == 0 ? w : b;
      const padding = 0
      const textX = (this.boxSize - this.fontSize) + (this.boxSize * row) + padding
      const textY = this.getHeight() - this.fontSize
      this.drawText(text, color, textX, textY)
    }
  }

  drawSqaures() {
    let { w, b } = this.colorScheme
    for (let row = 0; row < 8; row++) {
      let x = floor((this.getWidth() - this.boxSize * 8) / 2);
      let y = floor((this.getHeight() - this.boxSize * 8) / 2 + row * this.boxSize);
      for (let col = 0; col < 8; col++) {
        let color = (row + col) % 2 == 0 ? w : b;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.boxSize, this.boxSize);
        x += this.boxSize;
      }
    }

  }

  async render() {
    const Poppins = new FontFace('Poppins', 'url(https://fonts.gstatic.com/s/poppins/v23/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2)', { weight: '600' })
    await Poppins.load()
    document.fonts.add(Poppins)
    this.drawSqaures()
    this.drawFiles()
    this.drawRanks()


  }
}

customElements.define("chess-board", ChessBoard, { extends: "canvas" });