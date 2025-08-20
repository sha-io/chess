export enum ChessPiece {
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

export type BoardPiece = ChessPiece

export type Theme = {
    w: string;
    b: string;
}