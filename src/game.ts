export type Player = 'X' | 'O';
export type Cell = Player | null;
export type BoardState = Cell[];
export type MegaBoardState = BoardState[];
export type WinResult = Player | 'draw' | null;

export interface GameState {
    megaBoard: MegaBoardState;
    smallBoardWinners: WinResult[];
    currentPlayer: Player;
    activeBoard: number | null;
    gameWinner: WinResult;
}

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

export class UltimateTicTacToe {
    private state: GameState;

    constructor() {
        this.state = this.createInitialState();
    }

    private createInitialState(): GameState {
        return {
            megaBoard: Array(9).fill(null).map(() => Array(9).fill(null)),
            smallBoardWinners: Array(9).fill(null),
            currentPlayer: 'X',
            activeBoard: null,
            gameWinner: null,
        };
    }

    public getState(): GameState {
        return { ...this.state };
    }

    public reset(): void {
        this.state = this.createInitialState();
    }

    public makeMove(boardIndex: number, cellIndex: number): boolean {
        if (!this.isValidMove(boardIndex, cellIndex)) {
            return false;
        }

        this.state.megaBoard[boardIndex][cellIndex] = this.state.currentPlayer;

        const winner = this.checkWinner(this.state.megaBoard[boardIndex]);
        if (winner) {
            this.state.smallBoardWinners[boardIndex] = winner;
            const gameWinner = this.checkWinner(this.state.smallBoardWinners);
            if (gameWinner) {
                this.state.gameWinner = gameWinner;
                this.state.activeBoard = null;
                return true;
            }
        }

        if (this.state.smallBoardWinners[cellIndex] !== null || this.isBoardFull(this.state.megaBoard[cellIndex])) {
            this.state.activeBoard = null;
        } else {
            this.state.activeBoard = cellIndex;
        }

        if (this.isGameDraw()) {
            this.state.gameWinner = 'draw';
            this.state.activeBoard = null;
        }

        this.state.currentPlayer = this.state.currentPlayer === 'X' ? 'O' : 'X';
        return true;
    }

    public isValidMove(boardIndex: number, cellIndex: number): boolean {
        if (this.state.gameWinner !== null) {
            return false;
        }

        if (this.state.megaBoard[boardIndex][cellIndex] !== null) {
            return false;
        }

        if (this.state.smallBoardWinners[boardIndex] !== null) {
            return false;
        }

        if (this.state.activeBoard !== null && this.state.activeBoard !== boardIndex) {
            return false;
        }

        return true;
    }

    private checkWinner(board: (Cell | WinResult)[]): WinResult {
        for (const combination of WINNING_COMBINATIONS) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a] as WinResult;
            }
        }

        if (board.every(cell => cell !== null)) {
            return 'draw';
        }

        return null;
    }

    private isBoardFull(board: Cell[]): boolean {
        return board.every(cell => cell !== null);
    }

    private isGameDraw(): boolean {
        return this.state.smallBoardWinners.every((winner, index) =>
            winner !== null || this.isBoardFull(this.state.megaBoard[index])
        ) && this.checkWinner(this.state.smallBoardWinners) === null;
    }

    public canPlayInBoard(boardIndex: number): boolean {
        if (this.state.gameWinner !== null) {
            return false;
        }

        if (this.state.smallBoardWinners[boardIndex] !== null) {
            return false;
        }

        if (this.state.activeBoard === null) {
            return true;
        }

        return this.state.activeBoard === boardIndex;
    }
}
