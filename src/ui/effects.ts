import { round } from "../utils/math";
import ChessCanvas from "./canvas";

type highlightedSquares = GridCoords & { colour: string }
export default class ChessEffect extends ChessCanvas {
    highlightedSquares: highlightedSquares[] = [];
    private flashingTimeoutID: number | null = null;
    private flashingIntervalID: number | null = null;

    constructor(w: number, h: number) {
        super(w, h);
        this.id = 'chess-effects'
    }

    highlightSquare(options: { row: number, col: number, colour: string, persist?: boolean }) {
        let { row, col, colour, persist } = options
        this.clear()
        this.ctx.fillStyle = colour;
        this.ctx.fillRect(this.boxSize * col, this.boxSize * row, this.boxSize, this.boxSize);


        if (persist) {
            if (this.highlightedSquares.length == 2) this.highlightedSquares = []
            this.highlightedSquares.push({ row, col, colour })
        };
        this.render()
    }

    flashSquare(options: { row: number, col: number, colour: string }) {
        let { row, col, colour } = options

        // Clear any existing flash animations
        if (this.flashingTimeoutID) {
            clearTimeout(this.flashingTimeoutID);
            this.flashingTimeoutID = null;
        }
        if (this.flashingIntervalID) {
            clearInterval(this.flashingIntervalID);
            this.flashingIntervalID = null;
        }

        this.ctx.fillStyle = colour

        let visible = true;
        const duration = 1500;
        const interval = duration / 6;

        const size = round(this.boxSize);
        const x = round(size * col);
        const y = round(size * row);

        this.ctx.fillStyle = colour
        this.ctx.fillRect(x, y, size, size);

        this.flashingIntervalID = setInterval(() => {
            if (visible) {
                this.ctx.clearRect(x, y, size, size);
            } else {
                this.ctx.fillRect(x, y, size, size);
            }
            visible = !visible;
        }, interval);

        this.flashingTimeoutID = setTimeout(() => {
            if (this.flashingIntervalID) {
                clearInterval(this.flashingIntervalID);
                this.flashingIntervalID = null;
            }
            this.flashingTimeoutID = null;
            this.clear();
            this.render();
        }, duration);
    }

    render() {
        for (const square of this.highlightedSquares) {
            this.ctx.fillStyle = square.colour;
            this.ctx.fillRect(this.boxSize * square.col, this.boxSize * square.row, this.boxSize, this.boxSize);
        }
    }
}

customElements.define("chess-effect", ChessEffect, { extends: "canvas" });

