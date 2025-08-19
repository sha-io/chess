import Piece from "./piece";
import { ChessPiece } from "../types/chess.types";

export default class ChessModal extends HTMLDivElement {
    static whitePieces: ChessPiece[] = [ChessPiece.wq, ChessPiece.wb, ChessPiece.wn, ChessPiece.wr]
    static blackPieces: ChessPiece[] = [ChessPiece.bq, ChessPiece.bb, ChessPiece.bn, ChessPiece.br]
    turn: turn
    selection?: Promise<ChessPiece>;
    background: string = 'white';
    size?: number = 10
    x?: number
    y?: number
    pieces?: Piece[] = []
    constructor(turn: turn, size: number = 10, x: number = 0, y: number = 0) {
        super()
        this.id = 'promotion-modal'
        /* Styles */
        this.turn = turn
        this.size = size
        this.style.display = 'grid'
        this.style.position = 'absolute'
        this.style.background = this.background
        this.style.left = `${x}px`
        this.style.top = `${y}px`
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)';
    }

    connectedCallback() {
        this.load()
    }

    load() {
        let color = this.turn === 'w' ? ChessModal.whitePieces : ChessModal.blackPieces;
        this.selection = new Promise(resolve => {
            for (const piece of color) {
                let chessPiece = new Piece(piece);
                if (this.size) chessPiece.width = this.size;
                this.appendChild(chessPiece);

                chessPiece.onclick = () => {
                    resolve(chessPiece.type);
                    this.remove();
                };
            }
        });
    }
}

customElements.define("chess-modal", ChessModal, { extends: "div" });
