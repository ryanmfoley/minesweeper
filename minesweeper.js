'use strict';

// Grab button
const setMinesButton = document.querySelector('#set-mines');

// Create Object constructor that creates cell objects
function Cell(row, col) {
	this.row = row;
	this.col = col;
	this.cellBox = document.querySelectorAll(`.row-${row}`)[col];
	this.isOpen = false;
	this.isLocked = false;
	this.isMine = false;
	this.adjacentMines = 0;
}

// Create a 2D array of 100 square objects that form a 10 X 10 grid
function build2DArray(rows, cols) {
	let arr = new Array(rows);
	for (let i = 0; i < rows; i++) {
		arr[i] = new Array(cols);
	}
	return arr;
}

// Create and add cell objects to the 2D grid array
function setupGrid(rows, cols) {
	let grid = build2DArray(rows, cols);
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			grid[row][col] = new Cell(row, col);
		}
	}
	return grid;
}

// Create a function that clears the grid
function clearGrid(rowLimit, colLimit) {
	for (let row = 0; row < rowLimit; row++) {
		for (let col = 0; col < colLimit; col++) {
			grid[row][col].cellBox.innerHTML = '';
			grid[row][col].cellBox.style.backgroundColor = 'lightgray';
			grid[row][col].isMine = false;
			grid[row][col].adjacentMines = 0;
		}
	}
}

function selectCell(cell) {
	const cellRow = cell.classList[0].match(/\d+/);
	const cellCol = cell.classList[1].match(/\d+/);
	return grid[cellRow][cellCol];
}

// Create function to count number of mines in adjacent cells
function countAdjacentMines(cell) {
	// Grab adjacent cell objects
	let minRow = cell.row - 1 >= 0 ? cell.row - 1 : 0;
	let maxRow = cell.row + 1 <= 14 ? cell.row + 1 : 14;
	let minCol = cell.col - 1 >= 0 ? cell.col - 1 : 0;
	let maxCol = cell.col + 1 <= 14 ? cell.col + 1 : 14;

	// Count adjacent cells that contain mines and update cell.adjacentMines
	for (let x = minRow; x <= maxRow; x++) {
		for (let y = minCol; y <= maxCol; y++) {
			if (grid[x][y].isMine === true) {
				cell.adjacentMines += 1;
			}
		}
	}
	// Display adjacentMines count
	cell.cellBox.style.backgroundColor = 'darkgray';
	if (cell.adjacentMines > 0) cell.cellBox.innerHTML = cell.adjacentMines;
	if (cell.adjacentMines === 0) cell.cellBox.innerHTML = ' ';
	if (cell.adjacentMines > 3) cell.cellBox.style.color = 'black';
	if (cell.adjacentMines === 3) cell.cellBox.style.color = 'red';
	if (cell.adjacentMines === 2) cell.cellBox.style.color = 'green';
	if (cell.adjacentMines === 1) cell.cellBox.style.color = 'blue';
	cell.isOpen = true;
	checkWin();

	// Reveal neighboring cells that have no mines
	if (cell.adjacentMines === 0) {
		for (let x = minRow; x <= maxRow; x++) {
			for (let y = minCol; y <= maxCol; y++) {
				if (
					grid[x][y].cellBox.innerHTML === '' &&
					grid[x][y].isMine === false
				) {
					// Recursion function
					countAdjacentMines(grid[x][y]);
				}
			}
		}
	}
}

// Reveal mines
function revealMines() {
	grid.forEach((row) => {
		row.forEach((cell) => {
			if (cell.isMine === true) {
				// Create and display mines
				const mine = document.createElement('img');
                mine.src = 'images/mine-icon.png';
                // Reset cell and append mine
				cell.cellBox.innerHTML = '';
				cell.cellBox.append(mine);
			}
		});
	});
}

// Check win
function checkWin() {
	let win = true;
	grid.forEach((row) => {
		row.forEach((cell) => {
			if (cell.cellBox.innerHTML === '') {
				win = false;
			}
		});
	});
	if (win) {
		setTimeout(revealMines, 800);
		openWinModal();
		startGame = false;
		grid = setupGrid(15, 15);
	}
}

// Win animation
const winModal = document.querySelector('#modal');

const loseModal = document.querySelector('#modal-lose');

function openWinModal() {
	setTimeout(function () {
		winModal.style.display = 'grid';
	}, 1200);
}

function openLoseModal() {
	setTimeout(function () {
		loseModal.style.display = 'grid';
	}, 1200);
}

function closeModal() {
	winModal.style.display = 'none';
	loseModal.style.display = 'none';
}

// Game started
let startGame = false;

// Build Grid
let grid = setupGrid(15, 15);

// Grab cells
const cells = document.querySelector('.grid');

// Set mines and assign adjacentMine values
setMinesButton.addEventListener('click', (event) => {
	event.preventDefault();

	// Clear grid
	closeModal();
    clearGrid(15, 15);
    
    // Create grid objects
    grid = setupGrid(15, 15);

	let mineCount = 0;
	while (mineCount < 30) {
		// Create random number (0-9)
		let randomRow = Math.floor(Math.random() * 15);
		let randomCol = Math.floor(Math.random() * 15);

		// Set isMine to true for 10 random cells
		if (grid[randomRow][randomCol].cellBox.innerHTML === '') {
			grid[randomRow][randomCol].isMine = true;
			mineCount++;
		}
	}
	startGame = true;
});

// Listen for cell clicks
cells.addEventListener('click', (event) => {
	if (startGame === true) {
		// Grab the object of the cell that was clicked
		const cell = selectCell(event.target);

		// Check if cell is locked
		if (cell.isLocked === false) {
			// Check if user clicked on a mine
			if (cell.isMine === true) {
				setTimeout(revealMines, 800);
				setTimeout(openLoseModal, 800);

				// If cell hasn't already been revealed
			} else if (cell.isOpen !== true) {
				// cell.isOpen can trigger a function
				cell.isOpen = true;

				countAdjacentMines(cell);
			}
		}
	}
});

// Listen for cell right clicks
cells.addEventListener(
	'contextmenu',
	(event) => {
		event.preventDefault();

		if (startGame == true) {
			// Grab the object of the cell that was clicked
			const cell = selectCell(event.target);

			// Check if cell is open or closed
			if (cell.isOpen === false) {
				// Toggle lock/unlock
				if (cell.isLocked !== true) {
					cell.isLocked = true;
					cell.cellBox.textContent = '!';
					cell.cellBox.style.color = 'red';
				} else {
					cell.isLocked = false;
					cell.cellBox.innerHTML = '';
					cell.cellBox.style.color = 'black';
				}
				return false;
			}
		}
	},
	false
);

cells.addEventListener('click', (event) => {
	event.preventDefault;
	checkWin();
});

cells.addEventListener(
	'contextmenu',
	(event) => {
		event.preventDefault();
		checkWin();
		return false;
	},
	false
);
