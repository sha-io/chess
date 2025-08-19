import { ChessPiece } from "../types/chess.types";

export default class Piece extends HTMLImageElement {
    type: ChessPiece;
    static readonly PieceSource: Record<ChessPiece, string> = {
        [ChessPiece.wk]: "/white-king.png",
        [ChessPiece.wq]: "/white-queen.png",
        [ChessPiece.wr]: "/white-rook.png",
        [ChessPiece.wb]: "/white-bishop.png",
        [ChessPiece.wn]: "/white-knight.png",
        [ChessPiece.wp]: "/white-pawn.png",
        [ChessPiece.bk]: "/black-king.png",
        [ChessPiece.bq]: "/black-queen.png",
        [ChessPiece.br]: "/black-rook.png",
        [ChessPiece.bb]: "/black-bishop.png",
        [ChessPiece.bn]: "/black-knight.png",
        [ChessPiece.bp]: "/black-pawn.png",
    };
    x: number;
    y: number;
    private hasMoved: boolean = false;
    constructor(type: ChessPiece, x: number = 0, y: number = 0) {
        super();
        this.x = x;
        this.y = y;
        this.type = type;
        this.src = Piece.PieceSource[this.type];
    }

    set moved(value: boolean) {
        this.hasMoved = value;
    }

    get moved() {
        return this.hasMoved;
    }

    draw(ctx: CanvasRenderingContext2D, h: number, w: number) {
        ctx.drawImage(this, this.x, this.y, h, w);
        if (!this.complete)
            this.onload = () => {
                ctx.drawImage(this, this.x, this.y, h, w);
            };
    }
}
customElements.define("chess-piece", Piece, { extends: "img" });
