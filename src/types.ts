function floor(n: number) {
  return Math.floor(n);
}

function round(n: number) {
  return Math.round(n);
}

function sign(n: number) {
  return Math.sign(n)
}

function abs(n: number) {
  return Math.abs(n)
}

function clamp(min: number, val: number, max: number) {
  return Math.min(Math.max(min, val), max);
}

interface PieceMove {
  col: number;
  row: number;
  x?: number;
  y?: number;
}

interface ChessCanvas {
  setDPR(): void;
  clear(): void;
  getHeight(): number;
  getWidth(): number;
  render(): void;
}

export enum PieceCode {
  wk = "wk",
  wq = "wq",
  wr = "wr",
  wb = "wb",
  wn = "wn",
  wp = "wp",
  bk = "bk",
  bq = "bq",
  br = "br",
  bb = "bb",
  bn = "bn",
  bp = "bp",
}
export type boardPiece = PieceCode | null;
export type board = boardPiece[][];

class ChessCanvas extends HTMLCanvasElement implements ChessCanvas {
  dpr: number;
  ctx: CanvasRenderingContext2D;
  constructor(w: number, h: number) {
    super();
    this.ctx = this.getContext("2d") as CanvasRenderingContext2D;
    this.dpr = window.devicePixelRatio || 1;
    this.width = w;
    this.height = h;
    this.setDPR();
  }
  setDPR() {
    this.style.width = this.width + "px";
    this.style.height = this.height + "px";
    this.width *= this.dpr;
    this.height *= this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }
  getWidth() {
    return this.width / this.dpr;
  }

  getHeight() {
    return this.height / this.dpr;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
export class Piece extends HTMLImageElement {
  type: PieceCode;
  static PieceSource: Record<PieceCode, string> = {
    [PieceCode.wk]: "/white-king.png",
    [PieceCode.wq]: "/white-queen.png",
    [PieceCode.wr]: "/white-rook.png",
    [PieceCode.wb]: "/white-bishop.png",
    [PieceCode.wn]: "/white-knight.png",
    [PieceCode.wp]: "/white-pawn.png",
    [PieceCode.bk]: "/black-king.png",
    [PieceCode.bq]: "/black-queen.png",
    [PieceCode.br]: "/black-rook.png",
    [PieceCode.bb]: "/black-bishop.png",
    [PieceCode.bn]: "/black-knight.png",
    [PieceCode.bp]: "/black-pawn.png",
  };
  x: number;
  y: number;
  dragging: boolean;
  hasMoved: boolean;
  constructor(type: PieceCode, x?: number, y?: number) {
    super();
    this.x = x || 0;
    this.y = y || 0;
    this.hasMoved = false;
    this.type = type;
    this.dragging = false;
    this.src = Piece.PieceSource[type];
  }

  setHasMoved(value: boolean) {
    this.hasMoved = value;
  }

  draw(ctx: CanvasRenderingContext2D, h: number, w: number) {
    this.onload = () => {
      ctx.drawImage(this, this.x, this.y, h, w);
    };
  }

  update(ctx: CanvasRenderingContext2D, h: number, w: number) {
    ctx.drawImage(this, this.x, this.y, h, w);
  }
}

export class ChessBoard extends ChessCanvas {
  size: number;
  state: board;
  constructor(w: number, h: number) {
    super(w, h);
    this.size = floor(w / 8);
    this.state = [];
  }

  render(w?: string, b?: string) {
    for (let row = 0; row < 8; row++) {
      let x = floor((this.getWidth() - this.size * 8) / 2);
      let y = floor((this.getHeight() - this.size * 8) / 2 + row * this.size);
      for (let col = 0; col < 8; col++) {
        let color = (row + col) % 2 == 0 ? (w ? w : "#fff") : b ? b : "#000";
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.size, this.size);
        x += this.size;
      }
    }
  }
}

export class PieceLayer extends ChessCanvas {
  renderStack: Piece[];
  size: number;
  onpiecedrop: Function | null;
  drawn: boolean;
  selected: {
    piece: Piece | null;
    pr: number | null;
    pc: number | null;
    px: number | null;
    py: number | null;
    cr: number | null;
    cc: number | null;
  };
  constructor(w: number, h: number) {
    super(w, h);
    this.drawn = false;
    this.selected = {
      piece: null,
      pr: null,
      pc: null,
      px: null,
      py: null,
      cr: null,
      cc: null,
    };
    this.onpiecedrop = null;
    this.size = floor(w / 8);
    this.renderStack = [];
    this.onmousedown = this.selectPiece;
    this.onmousemove = this.movePiece;
    this.onmouseup = this.dropPiece;
  }

  selectPiece(e: MouseEvent) {
    let x = e.offsetX;
    let y = e.offsetY;
    this.renderStack.forEach((piece) => {
      let isPieceSelected =
        x > piece.x &&
        x < piece.x + this.size &&
        y > piece.y &&
        y < piece.y + this.size;
      if (isPieceSelected) {
        this.selected.piece = piece;
        this.selected.piece.dragging = true;
        this.selected.pr = floor((y / this.size) % 8);
        this.selected.pc = floor((x / this.size) % 8);
        this.selected.px = piece.x;
        this.selected.py = piece.y;
      }
    });
  }

  movePiece(e: MouseEvent) {
    if (this.selected?.piece?.dragging) {
      let x = round(e.offsetX - this.size / 2);
      let y = round(e.offsetY - this.size / 2);
      this.selected.piece.x = x;
      this.selected.piece.y = y;

      requestAnimationFrame(() => {
        this.render();
      });
    }
  }

  dropPiece(e: MouseEvent) {
    if (this.selected?.piece?.dragging) {
      this.selected.piece.dragging = false;
      let y = round(e.offsetY - this.size / 2);
      let x = round(e.offsetX - this.size / 2);
      let snapX =
        round(x / this.size) * this.size +
        floor(this.getWidth() - this.size * 8) / 2;
      let snapY =
        round(y / this.size) * this.size +
        floor(this.getHeight() - this.size * 8) / 2;
      let from = {
        row: this.selected.pr,
        col: this.selected.pc,
      };
      let to = {
        row: floor((e.offsetY / this.size) % 8),
        col: floor((e.offsetX / this.size) % 8),
        x: snapX,
        y: snapY,
      };
      let isLegalMove = this.onpiecedrop!(
        from,
        to,
        this.selected.piece.type,
        this.selected.piece
      );
      if (isLegalMove) {
        this.selected.piece.x = snapX;
        this.selected.piece.y = snapY;
        this.selected.piece.setHasMoved(true);
        requestAnimationFrame(() => {
          this.render();
        });
        return;
      }
      this.selected.piece.x = this.selected.px as number;
      this.selected.piece.y = this.selected.py as number;
      requestAnimationFrame(() => {
        this.render();
      });
    }
  }

  load(board: board) {
    this.renderStack = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let code = board[row][col] as PieceCode;
        let piece = new Piece(code);
        if (code) {
          piece.x = floor(
            (this.getWidth() - this.size * 8) / 2 + this.size * col
          );
          piece.y = floor(
            (this.getHeight() - this.size * 8) / 2 + this.size * row
          );
          this.push(piece);
        }
      }
    }
  }

  push(p: Piece) {
    this.renderStack.push(p);
  }

  render() {
    this.clear();
    if (this.drawn) {
      this.renderStack.forEach((piece) => {
        piece.update(this.ctx, this.size, this.size);
      });
    }
    this.renderStack.forEach((piece) => {
      piece.draw(this.ctx, this.size, this.size);
    });
    this.drawn = true;
  }
}

export class ChessGame extends ChessCanvas {
  static DecodeFen: Record<string, PieceCode> = {
    p: PieceCode.bp,
    r: PieceCode.br,
    n: PieceCode.bn,
    b: PieceCode.bb,
    q: PieceCode.bq,
    k: PieceCode.bk,
    P: PieceCode.wp,
    R: PieceCode.wr,
    N: PieceCode.wn,
    B: PieceCode.wb,
    Q: PieceCode.wq,
    K: PieceCode.wk,
  };
  static StartingFEN: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  board: ChessBoard;
  pieces: PieceLayer;
  private moveCount: number;
  private isChecked: boolean = false
  private isMate: boolean = false;
  private drawn: boolean;
  private turn: "w" | "b";
  theme: {
    w: string;
    b: string;
  };
  private state: board = [];

  constructor(w: number, h: number) {
    super(w, h);
    this.drawn = false;
    this.board = new ChessBoard(w, h);
    this.pieces = new PieceLayer(w, h);
    this.loadFen(ChessGame.StartingFEN);
    this.turn = "w";
    this.moveCount = 1;
    this.pieces.onpiecedrop = this.handlePieceDrop.bind(this);
    this.theme = {
      w: "#fff",
      b: "#000",
    };
  }

  switchTurns() {
    this.turn = this.turn == "w" ? "b" : "w";
  }

  connectedCallback() {
    this.insertAdjacentElement("beforebegin", this.board);
    this.insertAdjacentElement("afterend", this.pieces);
  }

  getMoveCount() {
    return this.moveCount;
  }

  load(board: board) {
    this.setState(board);
    this.pieces.load(this.state);
  }

  getOpponentPieces(board: board, turn: 'w' | 'b') {
    const opponentPieces = [];
    let currentKing: { row: number; col: number; type: PieceCode } | null = null;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const position = board[row][col]
        const colour = position?.charAt(0)
        const type = position?.charAt(1)

        if (position == null) continue;

        if (colour != turn) {
          opponentPieces.push({
            row: row,
            col: col,
            type: position,
          })
        };

        if (colour == turn && type == 'k') {
          currentKing = {
            row: row,
            col: col,
            type: position,
          };
        }
      }
    }
    return { opponentPieces, currentKing };
  }

  getAllyPieces(board: board, turn: 'w' | 'b') {
    const allyPieces = [];
    let currentKing: { row: number; col: number; type: PieceCode } | null = null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const position = board[row][col]
        const colour = position?.charAt(0)
        const type = position?.charAt(1)
        if (position == null) continue;
        if (colour == turn) {
          allyPieces.push({
            row: row,
            col: col,
            type: position,
          })
        };
        if (colour == turn && type == 'k') {
          currentKing = {
            row: row,
            col: col,
            type: position,
          };
        }
      }
    }
    return { allyPieces, currentKing };
  }

  inCheck(board: board, turn: 'w' | 'b') {
    const { opponentPieces, currentKing } = this.getOpponentPieces(board, turn);
    if (!currentKing) {
      return false;
    }
    for (const piece of opponentPieces) {
      let from = {
        row: piece.row,
        col: piece.col
      }
      let to = {
        row: currentKing.row,
        col: currentKing.col
      }
      if (this.isValidMove(from, to, piece.type, board)) {
        return true
      }
    }
    return false
  }

  isCheckmate(board: board, turn: 'w' | 'b') {
    if (this.isChecked) {
      let movesAvaiable = this.getLegalMoves(board, turn)
      return movesAvaiable == 0
    }
    return false
  }

  generateBishopMoves(from: PieceMove, board: board, color: boardPiece) {
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

        let isValid = this.isLegalMove(from, to, color as PieceCode, board)
        if (isValid) moves.push(to)
      }
    }
    return moves
  }

  generateRookMoves(from: PieceMove, board: board, color: boardPiece) {
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
        let isValid = this.isLegalMove(from, to, color as PieceCode, board)
        if (isValid) moves.push(to)
      }
    }
    return moves
  }

  generateQueenMoves(from: PieceMove, board: board, color: boardPiece) {
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
        let isValid = this.isLegalMove(from, to, color as PieceCode, board)
        if (isValid) moves.push(to)
      }
    }
    return moves
  }

  generateKnightMoves(from: PieceMove, board: board, color: boardPiece) {
    const directions = [
      //TOP-BOTTOM MOVES
      { row: 2, col: -1 },
      { row: 2, col: 1 },
      { row: -2, col: -1 },
      { row: -2, col: 1 },

      //SIDEWAYS MOVES
      { row: -1, col: -2 },
      { row: 1, col: -2 },
      { row: 1, col: 2 },
      { row: -1, col: 2 },
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
        let isValid = this.isLegalMove(from, to, color as PieceCode, board)
        if (isValid) moves.push(to)
      }
    }
    return moves
  }

  generatePawnMoves(from: PieceMove, board: board, color: boardPiece) {
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
        let isValid = this.isLegalMove(from, to, color as PieceCode, board)
        if (isValid) moves.push(to)
      }
    }
    return moves
  }

  getLegalMoves(board: board, turn: 'w' | 'b') {
    const { allyPieces } = this.getAllyPieces(board, turn)
    let allowedMoves = new Set()
    for (const piece of allyPieces) {
      const from = {
        row: piece.row,
        col: piece.col
      }
      let TYPE = piece.type?.charAt(1);
      switch (TYPE) {
        case 'b':
          {
            let moves = this.generateBishopMoves(from, board, piece.type)
            if (moves.length > 0) allowedMoves.add({
              type: piece.type,
              valid: moves
            })
            break
          }
        case 'r':
          {
            let moves = this.generateRookMoves(from, board, piece.type)
            if (moves.length > 0) allowedMoves.add({
              type: piece.type,
              valid: moves
            })
            break
          }
        case 'q':
          {
            let moves = this.generateQueenMoves(from, board, piece.type)
            if (moves.length > 0) allowedMoves.add({
              type: piece.type,
              valid: moves
            })
            break
          }
        case 'n':
          {
            let moves = this.generateKnightMoves(from, board, piece.type)
            if (moves.length > 0) allowedMoves.add({
              type: piece.type,
              valid: moves
            })
            break
          }
        case 'p':
          {
            let moves = this.generatePawnMoves(from, board, piece.type)
            if (moves.length > 0) allowedMoves.add({
              type: piece.type,
              valid: moves
            })
            break
          }
      }
    }
    return allowedMoves.size
  }

  isLegalMove(from: PieceMove, to: PieceMove, type: PieceCode, board: board) {

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

  handlePieceDrop(from: PieceMove, to: PieceMove, type: PieceCode) {
    let board = structuredClone(this.state)
    let isLegalMove = this.isLegalMove(from, to, type, board)

    if (isLegalMove) {
      this.state[from.row][from.col] = null;
      this.state[to.row][to.col] = type;
      this.pieces.renderStack = this.pieces.renderStack.filter((piece) => !(piece.x == to.x && piece.y == to.y));
      this.moveCount++;
      this.switchTurns();
      this.isChecked = this.inCheck(this.state, this.turn)
      this.isMate = this.isCheckmate(this.state, this.turn)
      console.log(this.isMate)
      return true
    }
    return false
  }

  isValidMove(from: PieceMove, to: PieceMove, type: PieceCode, board: board) {
    let TYPE = type.charAt(1)
    let colour = type.charAt(0)
    let pawnStartingRow = colour == 'w' ? 6 : 1
    let destination = board[to.row][to.col]
    let colourAtDestination = destination?.charAt(0)

    /* COMPARISONS */
    let colDifference = sign(to.col - from.col)
    let rowDifference = sign(to.row - from.row)

    /* VECTORS */
    let colDistance = abs(to.col - from.col)
    let rowDistance = abs(to.row - from.row)
    let magnitude = Math.max(rowDistance, colDistance)

    /* FLAGS */
    let isForward = colour == 'w' ? rowDifference == -1 : rowDifference == 1
    let isDiagonal = abs(to.row - from.row) == abs(to.col - from.col)
    let isStraight = to.col == from.col || to.row == from.row
    let inStartingRow = colour == 'w' ? from.row == pawnStartingRow : from.row == pawnStartingRow

    const verifySlidingMove = function () {
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

    const verifyKnightMove = function () {
      if (colourAtDestination == colour) return false

      if (colDistance > 2 || rowDistance > 2) return false
      if (colDistance == 0 || rowDistance == 0) return false

      if (colDistance == 2 && rowDistance != 1) return false
      if (rowDistance == 2 && colDistance != 1) return false
      return true
    }

    const verifyPawnMove = function () {
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

    const verifyKingMove = function () {
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


  setState(board: board) {
    this.state = board;
  }

  printBoard() {
    if (this.state) console.log(this.state);
  }

  setTheme(w: string, b: string) {
    this.theme = {
      w: w,
      b: b,
    };
  }

  loadFen(fen: string) {
    let board = [];
    let pieces = fen.split(" ")[0].split("/");
    let row: boardPiece[] = [];
    let count = 0;
    for (let piece of pieces) {
      for (let letter of piece) {
        if (parseInt(letter)) {
          for (let i = 0; i < parseInt(letter); i++) {
            row.push(null);
          }
        } else {
          row.push(ChessGame.DecodeFen[letter]);
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

  render() {
    this.pieces.render();
    if (!this.drawn) {
      this.board.render(this.theme.w, this.theme.b);
      this.drawn = true;
    }
  }
}

customElements.define("chess-board", ChessBoard, { extends: "canvas" });
customElements.define("piece-layer", PieceLayer, { extends: "canvas" });
customElements.define("chess-game", ChessGame, { extends: "canvas" });
customElements.define("chess-piece", Piece, { extends: "img" });
