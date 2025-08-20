import ChessBoard from "../ui/board";
import ChessEffect from "../ui/effects";
import ChessModal from "../ui/modal";
import PieceLayer from "../ui/pieces";
import { ChessPiece, type Theme } from "../types/chess.types";
import { abs, floor, max, sign } from "../utils/math";
import Piece from "../ui/piece";

export default class ChessGame extends HTMLDivElement {
    private static StartingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    private static fenMap: Record<string, ChessPiece> = {
        "p": ChessPiece.bp,
        "r": ChessPiece.br,
        "n": ChessPiece.bn,
        "b": ChessPiece.bb,
        "q": ChessPiece.bq,
        "k": ChessPiece.bk,
        "P": ChessPiece.wp,
        "R": ChessPiece.wr,
        "N": ChessPiece.wn,
        "B": ChessPiece.wb,
        "Q": ChessPiece.wq,
        "K": ChessPiece.wk,
    };
    highlightColor: string = "#f6f66999";
    private chessBoard: ChessBoard;
    private chessPieces: PieceLayer;
    private chessEffect: ChessEffect;
    private moveCount: number;
    private isChecked: boolean = false
    private checkedKing: PieceData | null = null;
    private isMate: boolean = false
    private turn: turn;
    theme: Theme = {
        w: "#EBECD0",
        b: "#779556"
    }
    options = {
        label: false,
        theme: this.theme,
        highlightColor: {
            selected: this.highlightColor,
            check: this.highlightColor,
            move: this.highlightColor
        }
    };
    private boardState: Board = [];
    constructor(w: number, h: number, options?: GameOptions) {
        super()
        this.style.width = w + "px";
        this.style.height = h + "px";
        this.style.position = 'relative';
        this.style.borderRadius = '6px'
        this.style.overflow = 'hidden'
        this.chessBoard = new ChessBoard(w, h, options?.label);
        this.chessEffect = new ChessEffect(w, h);
        this.chessPieces = new PieceLayer(w, h);
        this.fenToBoard(ChessGame.StartingFEN);
        this.turn = "w";
        this.moveCount = 0;
        this.theme = this.theme
    }

    connectedCallback() {
        this.appendChild(this.chessBoard);
        this.appendChild(this.chessEffect);
        this.appendChild(this.chessPieces);

        this.onmousedown = this.selectSquare;
        this.chessPieces.pieceDrop = this.move.bind(this);

        this.chessBoard.colorScheme = this.theme;
        this.render({ board: true, pieces: true });
    }

    get width() {
        let { width } = this.getBoundingClientRect()
        return width
    }

    get height() {
        let { height } = this.getBoundingClientRect()
        return height
    }

    selectSquare(e: MouseEvent, highlightColor: string = this.highlightColor, persist: boolean = false) {
        if (this.chessPieces.selected) {
            let { row, col } = this.chessPieces.getMouseAsGrid(e);
            let options = {
                row: row,
                col: col,
                colour: highlightColor,
                persist: persist
            }
            this.chessEffect.highlightSquare(options)
        }
    }

    getMoveCount() {
        return this.moveCount;
    }

    load(board: Board) {
        this.setState(board);
        this.chessPieces.load(this.boardState);
    }

    private switchTurns() {
        this.turn = this.turn == "w" ? "b" : "w";
    }

    private getAttackers(board: Board, turn: turn) {
        const attackers = [];
        let defendingKing: PieceData | null = null;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const position = board[row][col]
                const colour = position?.charAt(0)
                const type = position?.charAt(1)
                const attackerData = {
                    row: row,
                    col: col,
                    type: position as ChessPiece,
                }

                if (position == null) continue;
                if (colour != turn) attackers.push(attackerData)

                if (colour == turn && type == 'k') {
                    defendingKing = {
                        row: row,
                        col: col,
                        type: position as ChessPiece,
                    };
                }
            }
        }
        return { attackers, defendingKing };
    }

    private getAllies(board: Board, turn: turn) {
        const allies = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const position = board[row][col]
                const colour = position?.charAt(0)

                const allyData = {
                    row: row,
                    col: col,
                    type: position as ChessPiece,
                }

                if (position == null) continue;
                if (colour == turn) {
                    allies.push(allyData)
                }
            }
        }
        return allies;
    }

    private canCastle(turn: turn) {
        let castleRights: CastleRights = {
            w: {
                k: true, q: true
            },
            b: {
                k: true, q: true
            }
        }
        let whiteKingSideRook = this.chessPieces.getPieceAt(7, 0)
        let whiteQueenSideRook = this.chessPieces.getPieceAt(7, 7)
        let whiteKing = this.chessPieces.getPieceAt(7, 4)
        let whiteKingSideSquares = [{ row: 7, col: 5 }, { row: 7, col: 6 }]
        let whiteQueenSideSquares = [{ row: 7, col: 2 }, { row: 7, col: 3 }]

        let blackKingSideRook = this.chessPieces.getPieceAt(0, 0)
        let blackQueenSideRook = this.chessPieces.getPieceAt(0, 7)
        let blackKingSideSquares = [{ row: 0, col: 5 }, { row: 0, col: 6 }]
        let blackQueenSideSquares = [{ row: 0, col: 2 }, { row: 0, col: 3 }]

        let canAttackKingSides = undefined
        let isSquareOccupied = undefined

        switch (turn) {
            case 'w':
                const { attackers: whiteAttackers } = this.getAttackers(this.boardState, 'w')
                if (whiteKingSideRook?.moved) {
                    castleRights.w.k = false
                }
                if (whiteQueenSideRook?.moved) {
                    castleRights.w.q = false
                }
                if (whiteKing?.moved) {
                    castleRights.w = {
                        k: false,
                        q: false
                    }
                }
                for (const attacker of whiteAttackers) {
                    let from = {
                        row: attacker.row,
                        col: attacker.col
                    }
                    for (const to of whiteKingSideSquares) {
                        canAttackKingSides = this.isValidMove(from, to, attacker.type, this.boardState)
                        isSquareOccupied = this.boardState[to.row][to.col] != null
                        if (canAttackKingSides || isSquareOccupied) castleRights.w.k = false
                    }
                    for (const to of whiteQueenSideSquares) {
                        canAttackKingSides = this.isValidMove(from, to, attacker.type, this.boardState)
                        isSquareOccupied = this.boardState[to.row][to.col] != null
                        if (canAttackKingSides || isSquareOccupied) castleRights.w.q = false
                    }
                }
                return castleRights
            case 'b':
                const { attackers: blackAttackers } = this.getAttackers(this.boardState, 'b')
                let king = this.chessPieces.getPieceAt(0, 4)
                if (blackKingSideRook?.moved) {
                    castleRights.b.k = false
                }
                if (blackQueenSideRook?.moved) {
                    castleRights.b.q = false
                }
                if (king?.moved) {
                    castleRights.b = {
                        k: false,
                        q: false
                    }
                }
                for (const attacker of blackAttackers) {
                    let from = {
                        row: attacker.row,
                        col: attacker.col
                    }
                    for (const to of blackKingSideSquares) {
                        canAttackKingSides = this.isValidMove(from, to, attacker.type, this.boardState)
                        isSquareOccupied = this.boardState[to.row][to.col] != null
                        if (canAttackKingSides || isSquareOccupied) castleRights.b.k = false
                    }
                    for (const to of blackQueenSideSquares) {
                        canAttackKingSides = this.isValidMove(from, to, attacker.type, this.boardState)
                        isSquareOccupied = this.boardState[to.row][to.col] != null
                        if (canAttackKingSides || isSquareOccupied) castleRights.b.q = false

                    }
                }
                return castleRights
            default:
                console.log('Invalid color')
                break;
        }
    }

    private castle(color: turn, side: 'QUEENSIDE' | 'KINGSIDE') {
        switch (color) {
            case 'w': {
                let kingSideRook = this.chessPieces.getPieceAt(7, 7)
                let queenSideRook = this.chessPieces.getPieceAt(7, 0)
                if (side == 'QUEENSIDE') {
                    /* Set previous position to null */
                    this.boardState[7][4] = null
                    this.boardState[7][0] = null
                    /* Update board to reflect castling */
                    this.boardState[7][2] = 'wk' as ChessPiece
                    this.boardState[7][3] = 'wr' as ChessPiece
                    /*Update piece data to reflect change */
                    if (queenSideRook) {
                        queenSideRook.moved = true
                        queenSideRook.x = floor(this.width / 8 * 3)
                        queenSideRook.y = floor(this.height / 8 * 7)
                    }
                }
                if (side == 'KINGSIDE') {
                    this.boardState[7][4] = null
                    this.boardState[7][7] = null

                    this.boardState[7][6] = 'wk' as ChessPiece
                    this.boardState[7][5] = 'wr' as ChessPiece

                    if (kingSideRook) {
                        kingSideRook.moved = true
                        kingSideRook.x = floor(this.width / 8 * 5)
                        kingSideRook.y = floor(this.height / 8 * 7)
                    }
                }
                break;
            }
            case 'b': {
                let kingSideRook = this.chessPieces.getPieceAt(0, 7)
                let queenSideRook = this.chessPieces.getPieceAt(0, 0)
                if (side == 'QUEENSIDE') {
                    this.boardState[0][0] = null
                    this.boardState[0][4] = null

                    this.boardState[0][2] = 'bk' as ChessPiece
                    this.boardState[0][3] = 'br' as ChessPiece

                    if (queenSideRook) {
                        queenSideRook.moved = true
                        queenSideRook.x = floor(this.width / 8 * 3)
                        queenSideRook.y = floor(this.height / 8 * 0)
                    }
                }
                if (side == 'KINGSIDE') {
                    this.boardState[0][4] = null
                    this.boardState[0][7] = null

                    this.boardState[0][6] = 'bk' as ChessPiece
                    this.boardState[0][5] = 'br' as ChessPiece

                    if (kingSideRook) {
                        kingSideRook.moved = true
                        kingSideRook.x = floor(this.width / 8 * 5)
                        kingSideRook.y = floor(this.height / 8 * 0)
                    }
                }
                break
            }
            default:
                console.log('Invalid color')
                break;
        }
    }

    private canPromote(from: PiecePosition, to: PiecePosition, type: ChessPiece) {
        let colour = type.charAt(0)
        let pieceType = type.charAt(1)
        let isPawn = pieceType == 'p'
        let isBottomRow = colour == 'w' ? from.row == 1 && to.row == 0 : from.row == 6 && to.row == 7
        let canPromote = isPawn && isBottomRow
        return canPromote
    }

    private promotePawn(colour: turn, x: number = 0, y: number = 0) {
        let modal = colour == 'w' ? new ChessModal(colour, this.chessBoard.boxSize, x, y) : new ChessModal(colour, this.chessBoard.boxSize, x, y - this.chessBoard.boxSize * 3)
        this.append(modal)
        this.chessPieces.inert = true
        return modal.selection?.then(msg => {
            this.chessPieces.inert = false
            return msg
        })
    }

    inCheck(board: Board, turn: turn) {
        const { attackers, defendingKing } = this.getAttackers(board, turn);
        if (!defendingKing) {
            return false;
        }
        for (const attacker of attackers) {
            let from = {
                row: attacker.row,
                col: attacker.col
            }
            let to = {
                row: defendingKing.row,
                col: defendingKing.col
            }
            if (this.isValidMove(from, to, attacker.type, board)) {
                return true
            }
        }
        return false
    }

    isCheckmate(board: Board, turn: turn) {
        board = structuredClone(board)
        if (this.isChecked) {
            let movesAvaiable = this.getLegalMoves(board, turn).size
            if (movesAvaiable == 0) {
                console.log("Checkmate: No moves available");
                console.log("Winner: " + (turn == 'w' ? 'Black' : 'White'));
                this.isMate = true
                return this.isMate
            }
        }
        return this.isMate
    }

    generateBishopMoves(board: Board, from: PiecePosition, type: ChessPiece) {
        let directions = [
            { row: 1, col: 1 }, //NE
            { row: 1, col: -1 }, //NW
            { row: -1, col: -1 }, //SW
            { row: -1, col: 1 } //SE
        ]
        let moves = []
        for (const direction of directions) {
            for (let i = 1; i < 8; i++) {
                const to = {
                    row: from.row + direction.row * i,
                    col: from.col + direction.col * i,
                }
                if (to.col > 7 || to.col < 0 || to.row > 7 || to.row < 0) {
                    break
                }

                let isValid = this.isLegalMove(from, to, type, board)
                if (isValid) moves.push(to)
            }
        }
        return moves
    }

    generateRookMoves(board: Board, from: PiecePosition, type: ChessPiece) {
        const directions = [
            { row: -1, col: 0 }, //N
            { row: 1, col: 0 }, //S
            { row: 0, col: -1 }, //W
            { row: 0, col: 1 }, //E
        ]

        const moves = []
        for (const direction of directions) {
            for (let i = 1; i < 8; i++) {
                const to = {
                    row: from.row + direction.row * i,
                    col: from.col + direction.col * i,
                }
                if (to.col > 7 || to.col < 0 || to.row > 7 || to.row < 0) {
                    break
                }
                let isValid = this.isLegalMove(from, to, type, board)
                if (isValid) moves.push(to)
            }
        }
        return moves
    }

    generateQueenMoves(board: Board, from: PiecePosition, type: ChessPiece) {
        const directions = [
            { row: -1, col: 0 }, //N
            { row: 1, col: 0 }, //S
            { row: 0, col: -1 }, //W
            { row: 0, col: 1 }, //E
            { row: 1, col: 1 }, //NE
            { row: 1, col: -1 }, //NW
            { row: -1, col: -1 }, //SW
            { row: -1, col: 1 } //SE
        ]
        const moves = []
        for (const direction of directions) {
            for (let i = 1; i < 8; i++) {
                const to = {
                    row: from.row + direction.row * i,
                    col: from.col + direction.col * i,
                }
                if (to.col > 7 || to.col < 0 || to.row > 7 || to.row < 0) {
                    break
                }
                let isValid = this.isLegalMove(from, to, type, board)
                if (isValid) moves.push(to)
            }
        }
        return moves
    }

    generateKnightMoves(board: Board, from: PiecePosition, type: ChessPiece) {
        const directions = [
            //TOP-BOTTOM MOVES
            { row: 2, col: -1 },
            { row: 2, col: 1 },
            { row: -2, col: -1 },
            { row: -2, col: 1 },

            //SIDEWAYS MOVES
            { row: 1, col: 2 },
            { row: 1, col: -2 },
            { row: -1, col: 2 },
            { row: -1, col: -2 },
        ]
        const moves = []
        for (const direction of directions) {
            for (let i = 1; i < 8; i++) {
                const to = {
                    row: from.row + direction.row * i,
                    col: from.col + direction.col * i,
                }
                if (to.col > 7 || to.col < 0 || to.row > 7 || to.row < 0) {
                    break
                }
                let isValid = this.isLegalMove(from, to, type, board)
                if (isValid) moves.push(to)
            }
        }
        return moves
    }

    generatePawnMoves(board: Board, from: PiecePosition, type: ChessPiece) {
        const directions = [
            { row: -1, col: 0 }, //N
            { row: 1, col: 0 }, //S
            { row: 0, col: -1 }, //W
            { row: 0, col: 1 }, //E
            { row: 1, col: 1 }, //NE
            { row: 1, col: -1 }, //NW
            { row: -1, col: -1 }, //SW
            { row: -1, col: 1 } //SE
        ]

        const moves = []
        for (const direction of directions) {
            for (let i = 1; i < 8; i++) {
                const to = {
                    row: from.row + direction.row * i,
                    col: from.col + direction.col * i,
                }
                if (to.col > 7 || to.col < 0 || to.row > 7 || to.row < 0) {
                    break
                }
                let isValid = this.isLegalMove(from, to, type, board)
                if (isValid) moves.push(to)
            }
        }
        return moves
    }

    generateKingMoves(board: Board, from: PiecePosition, type: ChessPiece) {
        const directions = [
            { row: -1, col: 0 }, //N
            { row: 1, col: 0 }, //S
            { row: 0, col: -1 }, //W
            { row: 0, col: 1 }, //E
            { row: 1, col: 1 }, //NE
            { row: 1, col: -1 }, //NW
            { row: -1, col: -1 }, //SW
            { row: -1, col: 1 } //SE
        ]

        const moves = []
        for (const direction of directions) {
            for (let i = 1; i < 3; i++) {
                const to = {
                    row: from.row + direction.row * i,
                    col: from.col + direction.col * i,
                }
                if (to.col > 7 || to.col < 0 || to.row > 7 || to.row < 0) {
                    break
                }
                let isValid = this.isLegalMove(from, to, type, board)
                if (isValid) moves.push(to)
            }
        }
        return moves
    }

    isValidMove(from: PiecePosition, to: PiecePosition, type: ChessPiece, board: Board) {
        /* Ensure Board is not mutuated */
        board = structuredClone(board);

        let TYPE = type.charAt(1)
        let colour = type.charAt(0) as 'w' | 'b'
        let pawnStartingRow = colour == 'w' ? 6 : 1
        let destination = board[to.row][to.col]
        let colourAtDestination = destination?.charAt(0)

        /* COMPARISONS */
        let colDifference = sign(to.col - from.col)
        let rowDifference = sign(to.row - from.row)

        /* VECTORS */
        let colDistance = abs(to.col - from.col)
        let rowDistance = abs(to.row - from.row)
        let magnitude = max(rowDistance, colDistance)

        /* FLAGS */
        let isForward = colour == 'w' ? rowDifference == -1 : rowDifference == 1
        let isDiagonal = abs(to.row - from.row) == abs(to.col - from.col)
        let isStraight = to.col == from.col || to.row == from.row
        let inStartingRow = colour == 'w' ? from.row == pawnStartingRow : from.row == pawnStartingRow

        const verifySlidingMove = () => {
            for (let i = 1; i <= magnitude; i++) {
                let row = from.row + i * rowDifference
                let col = from.col + i * colDifference
                let position = board[row][col]
                let atDestination = row == to.row && col == to.col
                if (position != null && !atDestination) return false
                if (atDestination && colour == colourAtDestination) return false
            }
            return true
        }

        const verifyKnightMove = () => {
            if (colourAtDestination == colour) return false

            if (colDistance > 2 || rowDistance > 2) return false
            if (colDistance == 0 || rowDistance == 0) return false
            if (colDistance == rowDistance) return false

            if (colDistance == 2 && rowDistance != 1) return false
            if (rowDistance == 2 && colDistance != 1) return false
            return true
        }

        const verifyPawnMove = () => {
            if (!isForward) return false
            if (!(isStraight || isDiagonal)) return false

            if (inStartingRow) {
                let middlePiece = board[from.row + rowDifference][from.col + colDifference]
                if (magnitude > 2) return false
                if (magnitude == 2 && middlePiece != null) return false
            }

            if (isDiagonal) {
                if (magnitude > 1) return false
                if (destination == null) return false
                if (destination?.charAt(0) == colour) return false
            }

            if (isStraight) {
                if (destination != null) return false
                if (!inStartingRow && magnitude > 1) return false
            }
            return true
        }

        const verifyKingMove = () => {
            let { row: fromRow, col: fromCol } = from
            let { row: destinationRow, col: destinationCol } = to
            let isWhite = colour == 'w'
            let isKingPosition = fromCol == 4
            let isBottomRow = isWhite ? fromRow == 7 && destinationRow == 7 && isKingPosition : fromRow == 0 && destinationRow == 0 && isKingPosition
            let isQueenSide = destinationCol == 2
            let isKingSide = destinationCol == 6
            if (isBottomRow && !this.isChecked) {
                let castleRights = this.canCastle(colour)
                switch (colour) {
                    case 'w':
                        if (isQueenSide && castleRights?.w.q) {
                            this.castle(colour, 'QUEENSIDE')
                            return true
                        }
                        if (isKingSide && castleRights?.w.k) {
                            this.castle(colour, 'KINGSIDE')
                            return true
                        }
                        break
                    case 'b':
                        if (isQueenSide && castleRights?.b.q) {
                            this.castle(colour, 'QUEENSIDE')
                            return true
                        }
                        if (isKingSide && castleRights?.b.k) {
                            this.castle(colour, 'KINGSIDE')
                            return true
                        }
                        break;
                    default:
                        return false
                }
            }

            if (magnitude != 1) return false
            if (colourAtDestination == colour) return false
            return true
        }

        switch (TYPE) {
            case 'b':
                if (!isDiagonal) return false
                return verifySlidingMove()

            case 'r':
                if (!isStraight) return false
                return verifySlidingMove()

            case 'q':
                if (!(isStraight || isDiagonal)) return false
                return verifySlidingMove()

            case 'p':
                return verifyPawnMove()

            case 'n':
                return verifyKnightMove()

            case 'k':
                return verifyKingMove()
        }
    }

    isLegalMove(from: PiecePosition, to: PiecePosition, type: ChessPiece, board: Board) {
        /* Ensure Board is not mutuated */
        board = structuredClone(board);

        /* No Movement and Not Your Turn*/
        if (from.col == to.col && from.row == to.row) return false
        if (type.charAt(0) != this.turn) return false

        /* FLAGS */
        let isValidMove = this.isValidMove(from, to, type, board)
        if (!isValidMove) return false

        /* Simulate Board Move */
        board[from.row][from.col] = null;
        board[to.row][to.col] = type;

        let inCheck = this.inCheck(board, this.turn)
        if (!(isValidMove && !inCheck)) return false;

        return true;
    }

    getLegalMoves(board: Board, turn: turn) {
        const allies = this.getAllies(board, turn)
        let allowedMoves = new Set()
        for (const piece of allies) {
            const from = {
                row: piece.row,
                col: piece.col
            }

            let TYPE = piece.type?.charAt(1);
            switch (TYPE) {
                case 'b':
                    {
                        let moves = this.generateBishopMoves(board, from, piece.type)
                        if (moves.length > 0) allowedMoves.add({
                            type: piece.type,
                            legal: moves
                        })
                        break
                    }
                case 'r':
                    {
                        let moves = this.generateRookMoves(board, from, piece.type)
                        if (moves.length > 0) allowedMoves.add({
                            type: piece.type,
                            legal: moves
                        })
                        break
                    }
                case 'q':
                    {
                        let moves = this.generateQueenMoves(board, from, piece.type)
                        if (moves.length > 0) allowedMoves.add({
                            type: piece.type,
                            legal: moves
                        })
                        break
                    }
                case 'n':
                    {
                        let moves = this.generateKnightMoves(board, from, piece.type)
                        if (moves.length > 0) allowedMoves.add({
                            type: piece.type,
                            legal: moves
                        })
                        break
                    }
                case 'p':
                    {
                        let moves = this.generatePawnMoves(board, from, piece.type)
                        if (moves.length > 0) allowedMoves.add({
                            type: piece.type,
                            legal: moves
                        })
                        break
                    }
                case 'k':
                    {
                        let moves = this.generateKingMoves(board, from, piece.type)
                        if (moves.length > 0) allowedMoves.add({
                            type: piece.type,
                            legal: moves
                        })
                        break
                    }
            }
        }
        return allowedMoves
    }

    private async move(from: PiecePosition, to: PiecePosition, type: ChessPiece) {
        let board = structuredClone(this.boardState)
        let isLegalMove = this.isLegalMove(from, to, type, board)
        let color = type.charAt(0)
        if (from.col == to.col && from.row == to.row) return false
        if (isLegalMove) {
            this.boardState[from.row][from.col] = null;
            this.boardState[to.row][to.col] = type
            this.chessPieces.renderQueue = this.chessPieces.renderQueue.filter((piece) => !(piece.x == to.x && piece.y == to.y));

            /* Check for Pawn Promotions */
            if (this.canPromote(from, to, type)) {
                let promotionType = await this.promotePawn(this.turn, to.x, to.y)
                if (promotionType && this.chessPieces.selected) {
                    this.boardState[to.row][to.col] = promotionType
                    this.chessPieces.selected.src = Piece.PieceSource[promotionType]
                    this.chessPieces.selected.type = promotionType
                }
            }

            /* Effect Handling */
            let options = {
                colour: '#f6f66999',
                persist: true
            }
            this.chessEffect.highlightSquare({ row: from.row, col: from.col, ...options });
            this.chessEffect.highlightSquare({ row: to.row, col: to.col, ...options });

            /* State Updation */
            this.switchTurns();
            this.moveCount++;
            this.isChecked = this.inCheck(this.boardState, this.turn)
            this.isMate = this.isCheckmate(this.boardState, this.turn)
            return true
        }


        if (this.isChecked) {
            this.checkedKing = this.getAttackers(this.boardState, this.turn).defendingKing
            if (this.checkedKing && color == this.turn) {
                this.chessEffect.flashSquare({
                    row: this.checkedKing.row,
                    col: this.checkedKing.col,
                    colour: 'rgba(220, 20, 60, 0.6)'
                })
            }
        }
        return false
    }

    private setState(board: Board) {
        this.boardState = board;
    }

    printBoard() {
        console.log(this.boardState);
    }

    setTheme(w: string, b: string) {
        this.chessBoard.colorScheme = {
            w: w,
            b: b,
        };
        this.render({ board: true })
    }

    fenToBoard(fen: string) {
        let board = [];
        let pieces = fen.split(" ")[0].split("/");
        let row: BoardPiece[] = [];
        let count = 0;
        for (let piece of pieces) {
            for (let letter of piece) {
                if (parseInt(letter)) {
                    for (let i = 0; i < parseInt(letter); i++) {
                        row.push(null);
                    }
                } else {
                    row.push(ChessGame.fenMap[letter]);
                }
                count++;
                if (row.length == 8) {
                    board.push(row);
                    count = 0;
                    row = [];
                }
            }
        }

        /*
        TODO: Add support for other FEN segement checking
        */
        this.load(board);
    }

    render(options?: { board?: boolean, pieces?: boolean }) {
        if (options?.board) {
            this.chessBoard.render();
        }
        if (options?.pieces) {
            this.chessPieces.render();
        }
    }
}

customElements.define("chess-game", ChessGame, { extends: "div" });
