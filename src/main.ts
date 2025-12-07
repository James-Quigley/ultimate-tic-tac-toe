import { UltimateTicTacToe, WinResult, GameConfig, GameMode, PlayerType } from './game';

class GameUI {
    private game: UltimateTicTacToe | null = null;
    private setupScreen: HTMLElement;
    private gameScreen: HTMLElement;
    private megaBoardElement: HTMLElement;
    private statusElement: HTMLElement;
    private scoresElement: HTMLElement;
    private resetButton: HTMLElement;
    private startGameButton: HTMLElement;
    private isComputerThinking = false;

    constructor() {
        this.setupScreen = document.getElementById('setup-screen')!;
        this.gameScreen = document.getElementById('game-screen')!;
        this.megaBoardElement = document.getElementById('mega-board')!;
        this.statusElement = document.getElementById('status')!;
        this.scoresElement = document.getElementById('scores')!;
        this.resetButton = document.getElementById('reset-btn')!;
        this.startGameButton = document.getElementById('start-game-btn')!;

        this.attachSetupListeners();
    }

    private attachSetupListeners(): void {
        this.startGameButton.addEventListener('click', () => {
            const modeInput = document.querySelector('input[name="mode"]:checked') as HTMLInputElement;
            const opponentInput = document.querySelector('input[name="opponent"]:checked') as HTMLInputElement;

            const config: GameConfig = {
                mode: modeInput.value as GameMode,
                playerO: opponentInput.value as PlayerType,
            };

            this.startGame(config);
        });

        this.resetButton.addEventListener('click', () => {
            this.showSetupScreen();
        });
    }

    private startGame(config: GameConfig): void {
        this.game = new UltimateTicTacToe(config);
        this.setupScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');

        this.initializeUI();
        this.attachGameListeners();
        this.updateUI();
    }

    private showSetupScreen(): void {
        this.setupScreen.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
        this.game = null;
    }

    private initializeUI(): void {
        this.megaBoardElement.innerHTML = '';

        for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
            const smallBoard = document.createElement('div');
            smallBoard.className = 'small-board';
            smallBoard.dataset.boardIndex = boardIndex.toString();

            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.dataset.boardIndex = boardIndex.toString();
                cell.dataset.cellIndex = cellIndex.toString();
                smallBoard.appendChild(cell);
            }

            this.megaBoardElement.appendChild(smallBoard);
        }
    }

    private attachGameListeners(): void {
        this.megaBoardElement.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('cell')) {
                const boardIndex = parseInt(target.dataset.boardIndex!);
                const cellIndex = parseInt(target.dataset.cellIndex!);
                this.handleCellClick(boardIndex, cellIndex);
            }
        });
    }

    private handleCellClick(boardIndex: number, cellIndex: number): void {
        if (!this.game || this.isComputerThinking) return;

        const state = this.game.getState();

        // Prevent human player from making moves for computer
        if (state.currentPlayer === 'O' && state.config.playerO === 'computer') {
            return;
        }

        if (this.game.makeMove(boardIndex, cellIndex)) {
            this.updateUI();

            // Trigger computer move if needed
            this.checkComputerMove();
        }
    }

    private async checkComputerMove(): Promise<void> {
        if (!this.game) return;

        const state = this.game.getState();

        if (state.currentPlayer === 'O' &&
            state.config.playerO === 'computer' &&
            state.gameWinner === null &&
            !this.isComputerThinking) {

            this.isComputerThinking = true;
            this.updateUI(); // Show "Computer is thinking..."

            // Add a small delay so the computer doesn't move instantly
            await new Promise(resolve => setTimeout(resolve, 500));

            this.isComputerThinking = false;

            if (this.game.makeComputerMove()) {
                this.updateUI();
            }
        }
    }

    private updateUI(): void {
        if (!this.game) return;

        const state = this.game.getState();
        const scores = this.game.getScores();

        // Update scores
        this.scoresElement.textContent = `Score: X ${scores.X} - ${scores.O} O`;

        for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
            const smallBoard = this.megaBoardElement.querySelector(
                `.small-board[data-board-index="${boardIndex}"]`
            ) as HTMLElement;

            const canPlay = this.game.canPlayInBoard(boardIndex);
            smallBoard.classList.toggle('active', canPlay && state.gameWinner === null);

            if (state.smallBoardWinners[boardIndex]) {
                smallBoard.classList.add('won');
                this.updateSmallBoardWinner(smallBoard, state.smallBoardWinners[boardIndex]!);
            }

            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                const cell = smallBoard.querySelector(
                    `.cell[data-cell-index="${cellIndex}"]`
                ) as HTMLButtonElement;

                const cellValue = state.megaBoard[boardIndex][cellIndex];
                cell.textContent = cellValue || '';
                cell.classList.toggle('filled', cellValue !== null);
                cell.classList.toggle('x', cellValue === 'X');
                cell.classList.toggle('o', cellValue === 'O');

                const isValid = this.game.isValidMove(boardIndex, cellIndex);
                const isComputerTurn = state.currentPlayer === 'O' && state.config.playerO === 'computer';
                cell.disabled = !isValid || isComputerTurn || this.isComputerThinking;
            }
        }

        this.updateStatus(state);
    }

    private updateSmallBoardWinner(smallBoard: HTMLElement, winner: WinResult): void {
        if (!winner) return;

        let overlay = smallBoard.querySelector('.winner-overlay') as HTMLElement;
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'winner-overlay';
            smallBoard.appendChild(overlay);
        }

        if (winner === 'draw') {
            overlay.textContent = '—';
            overlay.classList.add('draw');
        } else {
            overlay.textContent = winner;
            overlay.classList.add(winner.toLowerCase());
        }
    }

    private updateStatus(state: ReturnType<UltimateTicTacToe['getState']>): void {
        if (state.gameWinner === 'draw') {
            this.statusElement.textContent = "Game Over - It's a Draw!";
        } else if (state.gameWinner) {
            const modeDesc = state.config.mode === 'three-in-row' ? '3 in a row' : 'most wins';
            this.statusElement.textContent = `Game Over - ${state.gameWinner} Wins (${modeDesc})!`;
        } else if (this.isComputerThinking) {
            this.statusElement.textContent = 'Computer is thinking...';
        } else {
            const playerDesc = state.currentPlayer === 'O' && state.config.playerO === 'computer'
                ? 'Computer'
                : state.currentPlayer;

            if (state.activeBoard === null) {
                this.statusElement.textContent = `${playerDesc}'s turn - Play in any available board`;
            } else {
                this.statusElement.textContent = `${playerDesc}'s turn - Play in highlighted board`;
            }
        }
    }
}

new GameUI();
