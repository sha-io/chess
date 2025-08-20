interface IChessCanvas {
    getHeight(): number;
    getWidth(): number;
    trackMouse(e: MouseEvent, options?: { centered?: boolean }): Coords
    getMouseAsGrid(e: MouseEvent): GridCoords
    snapToGrid(e: MouseEvent): Coords
    render(): void;
    clear(): void;
}

interface PieceData { row: number; col: number; type: ChessPiece }

type Theme = {
    w: string;
    b: string;
}

type Coords = {
    x: number,
    y: number
}
type GridCoords = {
    row: number,
    col: number
}

type turn = 'w' | 'b'

type PiecePosition = {
    col: number;
    row: number;
    x?: number;
    y?: number;
}

type BoardPiece = ChessPiece | null;
type Board = BoardPiece[][];

type CastleRights = {
    w: {
        k: boolean, q: boolean
    },
    b: {
        k: boolean, q: boolean
    }
}

type GameOptions = { label?: boolean, theme?: Theme, highlightColor?: { selected?: string, check?: string, move?: string } }