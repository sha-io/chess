import { ChessGame, PieceCode, type board } from "./types";

const body = document.querySelector("body")!;
const begin: board = [
  [
    PieceCode.br,
    PieceCode.bn,
    PieceCode.bb,
    PieceCode.bq,
    PieceCode.bk,
    PieceCode.bb,
    PieceCode.bn,
    PieceCode.br,
  ],
  [
    PieceCode.bp,
    PieceCode.bp,
    PieceCode.bp,
    PieceCode.bp,
    PieceCode.bp,
    PieceCode.bp,
    PieceCode.bp,
    PieceCode.bp,
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    PieceCode.wp,
    PieceCode.wp,
    PieceCode.wp,
    PieceCode.wp,
    PieceCode.wp,
    PieceCode.wp,
    PieceCode.wp,
    PieceCode.wp,
  ],
  [
    PieceCode.wr,
    PieceCode.wn,
    PieceCode.wb,
    PieceCode.wq,
    PieceCode.wk,
    PieceCode.wb,
    PieceCode.wn,
    PieceCode.wr,
  ],
];
const newboard = new ChessGame(520, 520);
body.appendChild(newboard);

newboard.setTheme("#EBECD0", "#779556");
newboard.loadFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
// newboard.loadFen("2r5/pp2kpp1/8/q3Np2/2PP4/P7/1P3P1r/1K2R1R1 w - - 0 29");
// newboard.loadFen("8/Q6p/6p1/5p2/5P2/2p3P1/3r3P/2K1k3");
// newboard.loadFen("1n1Rkb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2K5");
// newboard.loadFen(
//   "2r3k1/pb4p1/4p3/1p3p1q/5Pn1/P1NQb2P/1P4P1/R1B2R1K w - - 4 24"
// );
// newboard.loadFen("1Q6/5pk1/2p3p1/1p2N2p/1b5P/1bn5/2r3P1/2K5 w - - 16 42");
// newboard.loadFen("7k/p7/4N1pp/8/2PP4/4p1qB/P3P3/R4K2 w - - 1 40");
newboard.render();
