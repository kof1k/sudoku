document.addEventListener('DOMContentLoaded', function() {
    const board = document.getElementById('sudoku-board');
    const numButtons = document.querySelectorAll('.num-btn');
    const hintBtn = document.getElementById('hint-btn');
    const checkBtn = document.getElementById('check-btn');
    const notesBtn = document.getElementById('notes-btn');
    const timerDisplay = document.getElementById('timer');
    const hintsCountDisplay = document.getElementById('hints-count');
    const successModal = document.getElementById('success-modal');
    const gameOverModal = document.getElementById('game-over-modal');
    const mistakesDisplay = document.getElementById('mistakes-count');
    
    let selectedCell = null;
    let seconds = 0;
    let hintsUsed = 0;
    let mistakes = 0;
    const maxHints = 3;
    const maxMistakes = 3;
    let timerInterval;
    let notesMode = false;
    let gameOver = false;
    let cells = [];
    let cellMap = {};
    
    const cellNotes = {};
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            cellNotes[`${i}-${j}`] = new Set();
        }
    }
    
    buildBoard();
    startTimer();
    updateHintsDisplay();
    updateNumberButtons();
    
    function buildBoard() {
        board.innerHTML = '';
        
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const box = document.createElement('div');
                box.className = 'sudoku-box';
                
                for (let cellRow = 0; cellRow < 3; cellRow++) {
                    for (let cellCol = 0; cellCol < 3; cellCol++) {
                        const row = boxRow * 3 + cellRow;
                        const col = boxCol * 3 + cellCol;
                        const value = puzzleData[row][col];
                        
                        const cell = document.createElement('div');
                        cell.className = 'cell';
                        cell.dataset.row = row;
                        cell.dataset.col = col;
                        
                        if (value !== 0) {
                            cell.textContent = value;
                            cell.classList.add('fixed');
                        }
                        
                        cell.addEventListener('click', handleCellClick);
                        box.appendChild(cell);
                        cellMap[`${row}-${col}`] = cell;
                    }
                }
                
                board.appendChild(box);
            }
        }
        
        cells = Array.from(board.querySelectorAll('.cell'));
    }
    
    function handleCellClick() {
        if (gameOver) return;
        
        const prevSelected = selectedCell;
        selectedCell = this;
        
        if (prevSelected) prevSelected.classList.remove('selected');
        this.classList.add('selected');
        
        const row = +this.dataset.row;
        const col = +this.dataset.col;
        const value = getCellValue(this);
        
        highlightCells(row, col, value);
    }
    
    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
            const secs = String(seconds % 60).padStart(2, '0');
            timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
    }
    
    function updateHintsDisplay() {
        if (hintsUsed >= maxHints) {
            hintBtn.disabled = true;
            hintBtn.classList.add('disabled');
        }
    }
    
    function updateMistakesDisplay() {
        if (mistakesDisplay) {
            mistakesDisplay.textContent = mistakes;
        }
    }
    
    function updateNumberButtons() {
        const counts = [0,0,0,0,0,0,0,0,0,0];
        for (let i = 0; i < 81; i++) {
            const val = getCellValue(cells[i]);
            if (val >= 1 && val <= 9) counts[val]++;
        }
        
        numButtons.forEach(btn => {
            const num = +btn.dataset.num;
            if (num >= 1 && num <= 9) {
                const done = counts[num] >= 9;
                btn.classList.toggle('completed', done);
                btn.disabled = done;
            }
        });
    }
    
    function highlightCells(row, col, selectedValue) {
        const boxStartRow = Math.floor(row / 3) * 3;
        const boxStartCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 81; i++) {
            const cell = cells[i];
            const r = +cell.dataset.row;
            const c = +cell.dataset.col;
            
            cell.classList.remove('highlighted', 'same-box', 'same-number');
            
            if (r === row || c === col) {
                cell.classList.add('highlighted');
            }
            
            if (r >= boxStartRow && r < boxStartRow + 3 && c >= boxStartCol && c < boxStartCol + 3) {
                cell.classList.add('same-box');
            }
            
            if (selectedValue && getCellValue(cell) === selectedValue) {
                cell.classList.add('same-number');
            }
        }
    }
    
    function checkWin() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = cellMap[`${i}-${j}`];
                if (getCellValue(cell) !== solution[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    function showWin() {
        gameOver = true;
        stopTimer();
        
        fetch('/game/submit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                solution: getCurrentBoard(),
                time: seconds,
                hints: hintsUsed,
                difficulty: difficulty
            })
        })
        .then(response => response.json())
        .then(() => {
            document.getElementById('final-time').textContent = timerDisplay.textContent;
            document.getElementById('final-hints').textContent = hintsUsed;
            successModal.classList.remove('hidden');
        });
    }
    
    function showGameOver() {
        gameOver = true;
        stopTimer();
        if (gameOverModal) {
            gameOverModal.classList.remove('hidden');
        } else {
            alert('Game Over! You made 3 mistakes.');
        }
    }
    
    function getCurrentBoard() {
        const board = [];
        for (let i = 0; i < 9; i++) {
            board[i] = [];
            for (let j = 0; j < 9; j++) {
                board[i][j] = getCellValue(cellMap[`${i}-${j}`]);
            }
        }
        return board;
    }
    
    function getCellValue(cell) {
        const first = cell.firstChild;
        if (first && first.nodeType === 3) {
            return +first.textContent || 0;
        }
        return 0;
    }
    
    function setCellValue(cell, value) {
        const first = cell.firstChild;
        if (first && first.nodeType === 3) first.remove();
        if (value) {
            cell.insertBefore(document.createTextNode(value), cell.firstChild);
            cell.classList.add('has-value');
        } else {
            cell.classList.remove('has-value');
        }
    }
    
    function renderNotes(cell, row, col) {
        const notes = cellNotes[`${row}-${col}`];
        let grid = cell.querySelector('.notes-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'notes-grid';
            cell.appendChild(grid);
        }
        grid.innerHTML = '';
        for (let n = 1; n <= 9; n++) {
            const span = document.createElement('span');
            span.className = 'note-cell';
            span.textContent = notes.has(n) ? n : '';
            grid.appendChild(span);
        }
    }
    
    function clearNotes(row, col) {
        cellNotes[`${row}-${col}`].clear();
        const grid = cellMap[`${row}-${col}`].querySelector('.notes-grid');
        if (grid) grid.remove();
    }
    
    function enterNumber(num) {
        if (gameOver || !selectedCell || selectedCell.classList.contains('fixed')) return;
        
        const row = +selectedCell.dataset.row;
        const col = +selectedCell.dataset.col;
        
        if (num === 0) {
            setCellValue(selectedCell, null);
            clearNotes(row, col);
            selectedCell.classList.remove('error', 'wrong');
            highlightCells(row, col, 0);
            updateNumberButtons();
            return;
        }
        
        if (notesMode) {
            setCellValue(selectedCell, null);
            const notes = cellNotes[`${row}-${col}`];
            notes.has(num) ? notes.delete(num) : notes.add(num);
            renderNotes(selectedCell, row, col);
            return;
        }
        
        if (num !== solution[row][col]) {
            mistakes++;
            updateMistakesDisplay();
            selectedCell.classList.add('wrong');
            setTimeout(() => selectedCell.classList.remove('wrong'), 400);
            
            if (mistakes >= maxMistakes) {
                showGameOver();
            }
            return;
        }
        
        clearNotes(row, col);
        setCellValue(selectedCell, num);
        selectedCell.classList.remove('error', 'wrong');
        selectedCell.classList.add('correct');
        highlightCells(row, col, num);
        updateNumberButtons();
        
        if (checkWin()) {
            showWin();
        }
    }
    
    numButtons.forEach(btn => {
        btn.addEventListener('click', () => enterNumber(+btn.dataset.num));
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'n' || e.key === 'N') {
            toggleNotesMode();
            return;
        }
        if (gameOver || !selectedCell) return;
        
        if (e.key >= '1' && e.key <= '9') {
            enterNumber(+e.key);
        } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            enterNumber(0);
        } else if (e.key.startsWith('Arrow')) {
            e.preventDefault();
            navigateCell(e.key);
        }
    });
    
    function navigateCell(dir) {
        if (!selectedCell) return;
        let row = +selectedCell.dataset.row;
        let col = +selectedCell.dataset.col;
        
        if (dir === 'ArrowUp') row = Math.max(0, row - 1);
        else if (dir === 'ArrowDown') row = Math.min(8, row + 1);
        else if (dir === 'ArrowLeft') col = Math.max(0, col - 1);
        else if (dir === 'ArrowRight') col = Math.min(8, col + 1);
        
        const newCell = cellMap[`${row}-${col}`];
        if (newCell && newCell !== selectedCell) {
            selectedCell.classList.remove('selected');
            newCell.classList.add('selected');
            selectedCell = newCell;
            highlightCells(row, col, getCellValue(newCell));
        }
    }
    
    function toggleNotesMode() {
        notesMode = !notesMode;
        notesBtn.classList.toggle('active', notesMode);
        notesBtn.textContent = notesMode ? 'Notes ON' : 'Notes';
    }
    
    notesBtn.addEventListener('click', toggleNotesMode);
    
    hintBtn.addEventListener('click', function() {
        if (gameOver || hintsUsed >= maxHints) return;
        
        fetch('/game/hint/')
            .then(r => r.json())
            .then(data => {
                if (data.error) return;
                const cell = cellMap[`${data.row}-${data.col}`];
                if (cell) {
                    clearNotes(data.row, data.col);
                    setCellValue(cell, data.value);
                    cell.classList.add('hint', 'fixed');
                    hintsUsed++;
                    hintsCountDisplay.textContent = hintsUsed;
                    updateHintsDisplay();
                    updateNumberButtons();
                    if (checkWin()) showWin();
                }
            });
    });
    
    checkBtn.addEventListener('click', function() {
        if (gameOver) return;
        if (checkWin()) {
            showWin();
        } else {
            alert('Keep going! Some cells are still empty or incorrect.');
        }
    });
    
    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let c of cookies) {
            c = c.trim();
            if (c.startsWith(name + '=')) {
                return decodeURIComponent(c.substring(name.length + 1));
            }
        }
        return null;
    }
});
