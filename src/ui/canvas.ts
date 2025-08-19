import { floor, round } from "../utils/math";

export default class ChessCanvas extends HTMLCanvasElement implements IChessCanvas {
    static dpr: number = window.devicePixelRatio || 1;
    ctx: CanvasRenderingContext2D;
    boxSize: number;
    constructor(w: number, h: number) {
        super();
        this.style.position = 'absolute'
        this.ctx = this.getContext("2d") as CanvasRenderingContext2D;
        this.boxSize = floor(w / 8);
        this.width = w;
        this.height = h;
    }

    connectedCallback() {
        this.style.width = this.width + "px";
        this.style.height = this.height + "px";
        this.width *= ChessCanvas.dpr;
        this.height *= ChessCanvas.dpr;
        this.ctx.scale(ChessCanvas.dpr, ChessCanvas.dpr);
    }

    getWidth() {
        return this.width / ChessCanvas.dpr;
    }

    getHeight() {
        return this.height / ChessCanvas.dpr;
    }

    trackMouse(e: MouseEvent, options?: { centered?: boolean }) {
        if (options?.centered) {
            return { x: round(e.offsetX - this.boxSize / 2), y: round(e.offsetY - this.boxSize / 2) }
        }
        return { x: e.offsetX, y: e.offsetY }
    }

    getMouseAsGrid(e: MouseEvent) {
        return {
            col: floor((e.offsetX - (this.getWidth() - this.boxSize * 8) / 2) / this.boxSize),
            row: floor((e.offsetY - (this.getHeight() - this.boxSize * 8) / 2) / this.boxSize)
        }
    }

    snapToGrid(e: MouseEvent) {
        const { x, y } = this.trackMouse(e, {
            centered: true
        })
        let snapToGridX = round(x / this.boxSize) * this.boxSize + floor(this.getWidth() - this.boxSize * 8) / 2;
        let snapToGridY = round(y / this.boxSize) * this.boxSize + floor(this.getHeight() - this.boxSize * 8) / 2;

        return { x: snapToGridX, y: snapToGridY }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
    }

    render() {

    }
}

customElements.define("chess-canvas", ChessCanvas, { extends: "canvas" });