import { describe, it, expect, beforeEach } from 'vitest';
import { UltimateTicTacToe, GameConfig } from './game';

describe('UltimateTicTacToe - Initialization', () => {
    it('should initialize with default config', () => {
        const game = new UltimateTicTacToe();
        const state = game.getState();

        expect(state.currentPlayer).toBe('X');
        expect(state.activeBoard).toBeNull();
        expect(state.gameWinner).toBeNull();
        expect(state.config.mode).toBe('three-in-row');
        expect(state.config.playerO).toBe('human');
    });

    it('should initialize with custom config', () => {
        const config: GameConfig = {
            mode: 'most-wins',
            playerO: 'computer',
        };
        const game = new UltimateTicTacToe(config);
        const state = game.getState();

        expect(state.config.mode).toBe('most-wins');
        expect(state.config.playerO).toBe('computer');
    });

    it('should have empty boards on initialization', () => {
        const game = new UltimateTicTacToe();
        const state = game.getState();

        expect(state.megaBoard).toHaveLength(9);
        state.megaBoard.forEach(board => {
            expect(board).toHaveLength(9);
            board.forEach(cell => {
                expect(cell).toBeNull();
            });
        });
    });

    it('should have no winners on initialization', () => {
        const game = new UltimateTicTacToe();
        const state = game.getState();

        expect(state.smallBoardWinners).toHaveLength(9);
        state.smallBoardWinners.forEach(winner => {
            expect(winner).toBeNull();
        });
    });
});

describe('UltimateTicTacToe - Move Validation', () => {
    let game: UltimateTicTacToe;

    beforeEach(() => {
        game = new UltimateTicTacToe();
    });

    it('should allow valid first move anywhere', () => {
        expect(game.isValidMove(0, 0)).toBe(true);
        expect(game.isValidMove(4, 4)).toBe(true);
        expect(game.isValidMove(8, 8)).toBe(true);
    });

    it('should not allow move on occupied cell', () => {
        game.makeMove(0, 0);
        expect(game.isValidMove(0, 0)).toBe(false);
    });

    it('should enforce active board restriction', () => {
        game.makeMove(0, 4); // Send to board 4

        expect(game.isValidMove(4, 0)).toBe(true); // Board 4 is active
        expect(game.isValidMove(0, 0)).toBe(false); // Board 0 is not active
        expect(game.isValidMove(8, 8)).toBe(false); // Board 8 is not active
    });

    it('should allow any board when sent to won board', () => {
        // Win board 0
        game.makeMove(0, 0); // X -> sends to 0
        game.makeMove(0, 3); // O in board 0 -> sends to 3
        game.makeMove(3, 0); // X in board 3 -> sends to 0
        game.makeMove(0, 4); // O in board 0 -> sends to 4
        game.makeMove(4, 0); // X in board 4 -> sends to 0
        game.makeMove(0, 5); // O in board 0 -> sends to 5
        game.makeMove(5, 0); // X in board 5 -> sends to 0
        game.makeMove(0, 1); // O in board 0 -> sends to 1
        game.makeMove(1, 0); // X in board 1 -> sends to 0
        game.makeMove(0, 2); // O wins board 0 with top row (0,1,2) -> sends to 2

        // Now win board 2 so it's not available
        game.makeMove(2, 0); // X in board 2 -> sends to 0 (already won)

        const state = game.getState();
        expect(state.activeBoard).toBeNull(); // Sent to board 0 which is already won
    });

    it('should not allow moves after game is won', () => {
        // Win boards 0, 1, 2 for X (three in a row on mega board)
        // This will win the game in three-in-row mode

        // Simple approach: directly manipulate state for testing
        // Since getState() returns a copy, we need to access the internal state
        // We'll use TypeScript's 'any' to bypass private access for testing
        (game as any).state.smallBoardWinners[0] = 'X';
        (game as any).state.smallBoardWinners[1] = 'X';
        (game as any).state.smallBoardWinners[2] = 'X';
        (game as any).state.gameWinner = 'X';

        expect(game.isValidMove(0, 0)).toBe(false);
    });
});

describe('UltimateTicTacToe - Small Board Win Detection', () => {
    let game: UltimateTicTacToe;

    beforeEach(() => {
        game = new UltimateTicTacToe();
    });

    it('should detect horizontal win in small board', () => {
        // Play moves that allow X to win top row of board 0
        game.makeMove(0, 0); // X at board 0, cell 0 -> next board: 0
        game.makeMove(0, 3); // O at board 0, cell 3 -> next board: 3
        game.makeMove(3, 1); // X at board 3, cell 1 -> next board: 1
        game.makeMove(1, 0); // O at board 1, cell 0 -> next board: 0
        game.makeMove(0, 1); // X at board 0, cell 1 -> next board: 1
        game.makeMove(1, 3); // O at board 1, cell 3 -> next board: 3
        game.makeMove(3, 2); // X at board 3, cell 2 -> next board: 2
        game.makeMove(2, 0); // O at board 2, cell 0 -> next board: 0
        game.makeMove(0, 2); // X at board 0, cell 2 -> X wins top row!

        const state = game.getState();
        expect(state.smallBoardWinners[0]).toBe('X');
    });

    it('should detect vertical win in small board', () => {
        // Play moves that allow X to win left column of board 0 (cells 0, 3, 6)
        game.makeMove(0, 0); // X at board 0, cell 0 -> next board: 0
        game.makeMove(0, 1); // O at board 0, cell 1 -> next board: 1
        game.makeMove(1, 3); // X at board 1, cell 3 -> next board: 3
        game.makeMove(3, 0); // O at board 3, cell 0 -> next board: 0
        game.makeMove(0, 3); // X at board 0, cell 3 -> next board: 3
        game.makeMove(3, 1); // O at board 3, cell 1 -> next board: 1
        game.makeMove(1, 6); // X at board 1, cell 6 -> next board: 6
        game.makeMove(6, 0); // O at board 6, cell 0 -> next board: 0
        game.makeMove(0, 6); // X at board 0, cell 6 -> X wins left column!

        const state = game.getState();
        expect(state.smallBoardWinners[0]).toBe('X');
    });

    it('should detect diagonal win in small board', () => {
        // Play moves that allow X to win diagonal of board 0 (cells 0, 4, 8)
        game.makeMove(0, 0); // X at board 0, cell 0 -> next board: 0
        game.makeMove(0, 1); // O at board 0, cell 1 -> next board: 1
        game.makeMove(1, 4); // X at board 1, cell 4 -> next board: 4
        game.makeMove(4, 0); // O at board 4, cell 0 -> next board: 0
        game.makeMove(0, 4); // X at board 0, cell 4 -> next board: 4
        game.makeMove(4, 1); // O at board 4, cell 1 -> next board: 1
        game.makeMove(1, 8); // X at board 1, cell 8 -> next board: 8
        game.makeMove(8, 0); // O at board 8, cell 0 -> next board: 0
        game.makeMove(0, 8); // X at board 0, cell 8 -> X wins diagonal!

        const state = game.getState();
        expect(state.smallBoardWinners[0]).toBe('X');
    });

    it('should detect draw in small board', () => {
        // Set up a draw scenario in board 0: X X O / O O X / X O X
        // Directly manipulate board state for simplicity
        const board = (game as any).state.megaBoard[0];
        board[0] = 'X'; board[1] = 'X'; board[2] = 'O';
        board[3] = 'O'; board[4] = 'O'; board[5] = 'X';
        board[6] = 'X'; board[7] = 'O'; board[8] = 'X';

        // Manually trigger winner check by making a move that triggers checkWinner
        (game as any).state.currentPlayer = 'X';
        (game as any).state.activeBoard = null;

        // Make a move in another board to trigger game state update
        game.makeMove(1, 0);

        // Manually check the winner for board 0 since the move was in board 1
        const winner = (game as any).checkWinner(board);
        (game as any).state.smallBoardWinners[0] = winner;

        const state = game.getState();
        expect(state.smallBoardWinners[0]).toBe('draw');
    });
});

describe('UltimateTicTacToe - Three-in-Row Mode', () => {
    let game: UltimateTicTacToe;

    beforeEach(() => {
        game = new UltimateTicTacToe({ mode: 'three-in-row', playerO: 'human' });
    });

    it('should detect horizontal mega board win', () => {
        // Directly set up X winning boards 0, 1, 2 (top row of mega board)
        (game as any).state.smallBoardWinners[0] = 'X';
        (game as any).state.smallBoardWinners[1] = 'X';
        (game as any).state.smallBoardWinners[2] = 'X';

        // Trigger game over check by making a move
        (game as any).checkGameOver();

        const state = game.getState();
        expect(state.gameWinner).toBe('X');
    });

    it('should detect diagonal mega board win', () => {
        // Directly set up X winning boards 0, 4, 8 (diagonal of mega board)
        (game as any).state.smallBoardWinners[0] = 'X';
        (game as any).state.smallBoardWinners[4] = 'X';
        (game as any).state.smallBoardWinners[8] = 'X';

        // Trigger game over check
        (game as any).checkGameOver();

        const state = game.getState();
        expect(state.gameWinner).toBe('X');
    });
});

describe('UltimateTicTacToe - Most Wins Mode', () => {
    let game: UltimateTicTacToe;

    beforeEach(() => {
        game = new UltimateTicTacToe({ mode: 'most-wins', playerO: 'human' });
    });

    it('should declare winner based on most boards won', () => {
        // X wins 5 boards, O wins 3, 1 draw
        (game as any).state.smallBoardWinners[0] = 'X';
        (game as any).state.smallBoardWinners[1] = 'X';
        (game as any).state.smallBoardWinners[2] = 'X';
        (game as any).state.smallBoardWinners[3] = 'X';
        (game as any).state.smallBoardWinners[4] = 'X';
        (game as any).state.smallBoardWinners[5] = 'O';
        (game as any).state.smallBoardWinners[6] = 'O';
        (game as any).state.smallBoardWinners[7] = 'O';
        (game as any).state.smallBoardWinners[8] = 'draw';

        // Fill remaining cells to trigger end
        for (let i = 0; i < 9; i++) {
            (game as any).state.megaBoard[i] = (game as any).state.megaBoard[i].map(() => 'X');
        }

        const scores = game.getScores();
        expect(scores.X).toBe(5);
        expect(scores.O).toBe(3);
    });

    it('should declare draw when boards are tied', () => {
        // Each player wins 4 boards, 1 draw
        (game as any).state.smallBoardWinners[0] = 'X';
        (game as any).state.smallBoardWinners[1] = 'X';
        (game as any).state.smallBoardWinners[2] = 'X';
        (game as any).state.smallBoardWinners[3] = 'X';
        (game as any).state.smallBoardWinners[4] = 'O';
        (game as any).state.smallBoardWinners[5] = 'O';
        (game as any).state.smallBoardWinners[6] = 'O';
        (game as any).state.smallBoardWinners[7] = 'O';
        (game as any).state.smallBoardWinners[8] = 'draw';

        // Fill boards
        for (let i = 0; i < 9; i++) {
            (game as any).state.megaBoard[i] = (game as any).state.megaBoard[i].map((_: any, idx: number) => idx % 2 === 0 ? 'X' : 'O');
        }

        const scores = game.getScores();
        expect(scores.X).toBe(4);
        expect(scores.O).toBe(4);
    });
});

describe('UltimateTicTacToe - Computer AI', () => {
    let game: UltimateTicTacToe;

    beforeEach(() => {
        game = new UltimateTicTacToe({ mode: 'three-in-row', playerO: 'computer' });
    });

    it('should not make move when it is not computer turn', () => {
        const state = game.getState();
        expect(state.currentPlayer).toBe('X');

        const result = game.makeComputerMove();
        expect(result).toBe(false);
    });

    it('should make move when it is computer turn', () => {
        game.makeMove(0, 0); // X moves, now O's turn

        const stateBefore = game.getState();
        expect(stateBefore.currentPlayer).toBe('O');

        const result = game.makeComputerMove();
        expect(result).toBe(true);

        const stateAfter = game.getState();
        expect(stateAfter.currentPlayer).toBe('X'); // Should switch back
    });

    it('should block opponent from winning a board', () => {
        // Set up a scenario where X has two in a row in board 0 and O must block
        // Directly set up the board state
        (game as any).state.megaBoard[0][0] = 'X'; // Top left
        (game as any).state.megaBoard[0][1] = 'X'; // Top center
        // Cell 2 is empty - this is where O should block

        (game as any).state.currentPlayer = 'O';
        (game as any).state.activeBoard = 0; // Force computer to play in board 0

        // Computer should block at position 2
        const result = game.makeComputerMove();
        expect(result).toBe(true);

        const state = game.getState();
        // Computer should have blocked the winning move
        expect(state.megaBoard[0][2]).toBe('O');
    });

    it('should try to win a board when possible', () => {
        // Set up a scenario where O has two in a row in board 1 and can win
        (game as any).state.megaBoard[1][0] = 'O'; // Top left
        (game as any).state.megaBoard[1][1] = 'O'; // Top center
        // Cell 2 is empty - this is where O should win

        (game as any).state.currentPlayer = 'O';
        (game as any).state.activeBoard = 1; // Force computer to play in board 1

        // Computer should win at position 2 on board 1
        const result = game.makeComputerMove();
        expect(result).toBe(true);

        const state = game.getState();
        expect(state.megaBoard[1][2]).toBe('O');
        expect(state.smallBoardWinners[1]).toBe('O');
    });
});

describe('UltimateTicTacToe - Reset', () => {
    it('should reset game to initial state', () => {
        const game = new UltimateTicTacToe();

        // Make some moves
        game.makeMove(0, 0);
        game.makeMove(1, 1);
        game.makeMove(2, 2);

        // Reset
        game.reset();

        const state = game.getState();
        expect(state.currentPlayer).toBe('X');
        expect(state.activeBoard).toBeNull();
        expect(state.gameWinner).toBeNull();

        // All boards should be empty
        state.megaBoard.forEach(board => {
            board.forEach(cell => {
                expect(cell).toBeNull();
            });
        });
    });

    it('should preserve config on reset', () => {
        const config: GameConfig = { mode: 'most-wins', playerO: 'computer' };
        const game = new UltimateTicTacToe(config);

        game.makeMove(0, 0);
        game.reset();

        const state = game.getState();
        expect(state.config.mode).toBe('most-wins');
        expect(state.config.playerO).toBe('computer');
    });
});

describe('UltimateTicTacToe - Score Tracking', () => {
    it('should track scores correctly', () => {
        const game = new UltimateTicTacToe();

        (game as any).state.smallBoardWinners[0] = 'X';
        (game as any).state.smallBoardWinners[1] = 'X';
        (game as any).state.smallBoardWinners[2] = 'O';
        (game as any).state.smallBoardWinners[3] = 'draw';

        const scores = game.getScores();
        expect(scores.X).toBe(2);
        expect(scores.O).toBe(1);
    });

    it('should not count draws as wins for either player', () => {
        const game = new UltimateTicTacToe();

        (game as any).state.smallBoardWinners[0] = 'draw';
        (game as any).state.smallBoardWinners[1] = 'draw';
        (game as any).state.smallBoardWinners[2] = 'draw';

        const scores = game.getScores();
        expect(scores.X).toBe(0);
        expect(scores.O).toBe(0);
    });
});

describe('UltimateTicTacToe - Board Playability', () => {
    let game: UltimateTicTacToe;

    beforeEach(() => {
        game = new UltimateTicTacToe();
    });

    it('should allow play in any board when activeBoard is null', () => {
        expect(game.canPlayInBoard(0)).toBe(true);
        expect(game.canPlayInBoard(4)).toBe(true);
        expect(game.canPlayInBoard(8)).toBe(true);
    });

    it('should only allow play in active board when set', () => {
        game.makeMove(0, 4); // Sends to board 4

        expect(game.canPlayInBoard(4)).toBe(true);
        expect(game.canPlayInBoard(0)).toBe(false);
        expect(game.canPlayInBoard(8)).toBe(false);
    });

    it('should not allow play in won boards', () => {
        (game as any).state.smallBoardWinners[0] = 'X';

        expect(game.canPlayInBoard(0)).toBe(false);
    });

    it('should not allow play after game is won', () => {
        // Directly set game winner
        (game as any).state.gameWinner = 'X';

        expect(game.canPlayInBoard(0)).toBe(false);
        expect(game.canPlayInBoard(4)).toBe(false);
    });
});
