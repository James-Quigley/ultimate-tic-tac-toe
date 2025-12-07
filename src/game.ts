export type Player = 'X' | 'O';
export type Cell = Player | null;
export type BoardState = Cell[];
export type MegaBoardState = BoardState[];
export type WinResult = Player | 'draw' | null;
export type GameMode = 'three-in-row' | 'most-wins';
export type PlayerType = 'human' | 'computer';

export interface GameConfig {
    mode: GameMode;
    playerO: PlayerType;
}

export interface GameState {
    megaBoard: MegaBoardState;
    smallBoardWinners: WinResult[];
    currentPlayer: Player;
    activeBoard: number | null;
    gameWinner: WinResult;
    config: GameConfig;
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

    constructor(config?: GameConfig) {
        this.state = this.createInitialState(config);
    }

    private createInitialState(config?: GameConfig): GameState {
        return {
            megaBoard: Array(9).fill(null).map(() => Array(9).fill(null)),
            smallBoardWinners: Array(9).fill(null),
            currentPlayer: 'X',
            activeBoard: null,
            gameWinner: null,
            config: config || { mode: 'three-in-row', playerO: 'human' },
        };
    }

    public getState(): GameState {
        return {
            megaBoard: this.state.megaBoard.map(board => [...board]),
            smallBoardWinners: [...this.state.smallBoardWinners],
            currentPlayer: this.state.currentPlayer,
            activeBoard: this.state.activeBoard,
            gameWinner: this.state.gameWinner,
            config: { ...this.state.config },
        };
    }

    public reset(config?: GameConfig): void {
        this.state = this.createInitialState(config || this.state.config);
    }

    public getScores(): { X: number; O: number } {
        let xWins = 0;
        let oWins = 0;

        for (const winner of this.state.smallBoardWinners) {
            if (winner === 'X') xWins++;
            else if (winner === 'O') oWins++;
        }

        return { X: xWins, O: oWins };
    }

    public makeMove(boardIndex: number, cellIndex: number): boolean {
        if (!this.isValidMove(boardIndex, cellIndex)) {
            return false;
        }

        this.state.megaBoard[boardIndex][cellIndex] = this.state.currentPlayer;

        const winner = this.checkWinner(this.state.megaBoard[boardIndex]);
        if (winner) {
            this.state.smallBoardWinners[boardIndex] = winner;
            this.checkGameOver();
        }

        if (this.state.smallBoardWinners[cellIndex] !== null || this.isBoardFull(this.state.megaBoard[cellIndex])) {
            this.state.activeBoard = null;
        } else {
            this.state.activeBoard = cellIndex;
        }

        if (this.state.gameWinner === null) {
            this.checkGameOver();
        }

        this.state.currentPlayer = this.state.currentPlayer === 'X' ? 'O' : 'X';
        return true;
    }

    private checkGameOver(): void {
        if (this.state.config.mode === 'three-in-row') {
            const gameWinner = this.checkWinner(this.state.smallBoardWinners);
            if (gameWinner) {
                this.state.gameWinner = gameWinner;
                this.state.activeBoard = null;
            }
        } else {
            // most-wins mode
            const allBoardsFinished = this.state.smallBoardWinners.every((winner, index) =>
                winner !== null || this.isBoardFull(this.state.megaBoard[index])
            );

            if (allBoardsFinished) {
                const scores = this.getScores();
                if (scores.X > scores.O) {
                    this.state.gameWinner = 'X';
                } else if (scores.O > scores.X) {
                    this.state.gameWinner = 'O';
                } else {
                    this.state.gameWinner = 'draw';
                }
                this.state.activeBoard = null;
            }
        }
    }

    public makeComputerMove(): boolean {
        if (this.state.currentPlayer !== 'O' || this.state.config.playerO !== 'computer') {
            return false;
        }

        const move = this.findBestMove();
        if (move) {
            return this.makeMove(move.boardIndex, move.cellIndex);
        }
        return false;
    }

    private findBestMove(): { boardIndex: number; cellIndex: number } | null {
        // Try to win a small board
        const winningMove = this.findWinningMove('O');
        if (winningMove) return winningMove;

        // Block opponent from winning a small board
        const blockingMove = this.findWinningMove('X');
        if (blockingMove) return blockingMove;

        // Try to play in the center of active board
        const centerMove = this.findCenterMove();
        if (centerMove) return centerMove;

        // Pick a random valid move
        return this.findRandomMove();
    }

    private findWinningMove(player: Player): { boardIndex: number; cellIndex: number } | null {
        const validBoards = this.getValidBoards();

        for (const boardIndex of validBoards) {
            const board = this.state.megaBoard[boardIndex];

            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                if (board[cellIndex] === null) {
                    // Simulate the move
                    board[cellIndex] = player;
                    const wouldWin = this.checkWinner(board) === player;
                    board[cellIndex] = null;

                    if (wouldWin && this.isValidMove(boardIndex, cellIndex)) {
                        return { boardIndex, cellIndex };
                    }
                }
            }
        }

        return null;
    }

    private findCenterMove(): { boardIndex: number; cellIndex: number } | null {
        const validBoards = this.getValidBoards();

        for (const boardIndex of validBoards) {
            if (this.state.megaBoard[boardIndex][4] === null && this.isValidMove(boardIndex, 4)) {
                return { boardIndex, cellIndex: 4 };
            }
        }

        return null;
    }

    private findRandomMove(): { boardIndex: number; cellIndex: number } | null {
        const validBoards = this.getValidBoards();

        for (const boardIndex of validBoards) {
            const validCells: number[] = [];

            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                if (this.isValidMove(boardIndex, cellIndex)) {
                    validCells.push(cellIndex);
                }
            }

            if (validCells.length > 0) {
                const cellIndex = validCells[Math.floor(Math.random() * validCells.length)];
                return { boardIndex, cellIndex };
            }
        }

        return null;
    }

    private getValidBoards(): number[] {
        if (this.state.activeBoard !== null) {
            return [this.state.activeBoard];
        }

        const validBoards: number[] = [];
        for (let i = 0; i < 9; i++) {
            if (this.canPlayInBoard(i)) {
                validBoards.push(i);
            }
        }
        return validBoards;
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
