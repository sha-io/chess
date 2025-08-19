import ChessCanvas from "./canvas";
import Piece from "./piece";
import type { ChessPiece } from "../types/chess.types";
import { floor } from "../utils/math";

export default class PieceLayer extends ChessCanvas {
    selected?: Piece;
    pieceData?: PiecePosition;
    isDragging: boolean = false;
    pieceDrop: (from: PiecePosition, to: PiecePosition, type: ChessPiece) => Promise<boolean> = async () => true;
    renderQueue: Piece[] = [];

    constructor(w: number, h: number) {
        super(w, h);
        this.id = 'piece-layer'
    }

    connectedCallback() {
        super.connectedCallback();
        this.onmouseup = this.dropPiece;
        this.onmousedown = this.selectPiece;
        this.onmousemove = this.movePiece;
    }

    selectPiece(e: MouseEvent) {
        let { x: mouseX, y: mouseY } = this.trackMouse(e)
        let { row, col } = this.getMouseAsGrid(e)
        let match = this.renderQueue.find(({ x, y }) => (mouseX > x && mouseX < x + this.boxSize) && (mouseY > y && mouseY < y + this.boxSize))
        if (match) {
            let { x, y } = match
            this.isDragging = true
            this.selected = match;
            this.pieceData = {
                row: row,
                col: col,
                x: x,
                y: y,
            }
        }
        this.selected = match
    }

    movePiece(e: MouseEvent) {
        let { x, y } = this.trackMouse(e, { centered: true })
        if (this.isDragging && this.selected) {
            this.selected.x = x;
            this.selected.y = y;
            requestAnimationFrame(() => this.render());
        }
    }

    async dropPiece(e: MouseEvent) {
        if (this.isDragging && this.selected) {
            let { x, y } = this.snapToGrid(e)
            let { row, col } = this.getMouseAsGrid(e)
            this.isDragging = false;
            let type = this.selected.type
            let to = {
                row: row,
                col: col,
                x: x,
                y: y,
            }

            let isLegalMove = await this.pieceDrop(this.pieceData as PiecePosition, to, type)

            if (!isLegalMove) {
                this.selected.x = this.pieceData?.x as number
                this.selected.y = this.pieceData?.y as number
                this.render();

            } else {
                this.selected.x = x;
                this.selected.y = y;
                this.selected.moved = true;
                this.render();

            }
        }
    }

    load(board: Board) {
        this.renderQueue = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let pieceCode = board[row][col];
                if (pieceCode) {
                    let chessPiece = new Piece(pieceCode);
                    chessPiece.x = floor(this.boxSize * col)
                    chessPiece.y = floor(this.boxSize * row)
                    this.addPieceToQueue(chessPiece);
                }
            }
        }
    }

    addPieceToQueue(piece: Piece) {
        this.renderQueue.push(piece);
    }

    getPieceAt(row: number, col: number) {
        return this.renderQueue.find(piece => piece.x % 8 == col && piece.y % 8 == row)
    }

    render() {
        this.clear();
        this.renderQueue.forEach(piece => piece.draw(this.ctx, this.boxSize, this.boxSize));
    }
}

customElements.define("piece-layer", PieceLayer, { extends: "canvas" });