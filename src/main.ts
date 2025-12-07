import { UltimateTicTacToe, WinResult } from './game';

class GameUI {
    private game: UltimateTicTacToe;
    private megaBoardElement: HTMLElement;
    private statusElement: HTMLElement;
    private resetButton: HTMLElement;

    constructor() {
        this.game = new UltimateTicTacToe();
        this.megaBoardElement = document.getElementById('mega-board')!;
        this.statusElement = document.getElementById('status')!;
        this.resetButton = document.getElementById('reset-btn')!;

        this.initializeUI();
        this.attachEventListeners();
        this.updateUI();
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

    private attachEventListeners(): void {
        this.megaBoardElement.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('cell')) {
                const boardIndex = parseInt(target.dataset.boardIndex!);
                const cellIndex = parseInt(target.dataset.cellIndex!);
                this.handleCellClick(boardIndex, cellIndex);
            }
        });

        this.resetButton.addEventListener('click', () => {
            this.game.reset();
            this.initializeUI();
            this.updateUI();
        });
    }

    private handleCellClick(boardIndex: number, cellIndex: number): void {
        if (this.game.makeMove(boardIndex, cellIndex)) {
            this.updateUI();
        }
    }

    private updateUI(): void {
        const state = this.game.getState();

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
                cell.disabled = !isValid;
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

    private updateStatus(state: ReturnType<typeof this.game.getState>): void {
        if (state.gameWinner === 'draw') {
            this.statusElement.textContent = "Game Over - It's a Draw!";
        } else if (state.gameWinner) {
            this.statusElement.textContent = `Game Over - ${state.gameWinner} Wins! 🎉`;
        } else if (state.activeBoard === null) {
            this.statusElement.textContent = `${state.currentPlayer}'s turn - Play in any available board`;
        } else {
            this.statusElement.textContent = `${state.currentPlayer}'s turn - Play in highlighted board`;
        }
    }
}

new GameUI();
