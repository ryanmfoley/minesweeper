'use strict'

const startGameBtn = document.querySelector('#start-game-btn')
const gameResultsModal = document.querySelector('#game-results-modal')
const cells = document.querySelectorAll('.grid > div')

// Create Object constructor that creates cell objects //
function Cell(row, col) {
	this.row = row
	this.col = col
	this.cellBox = document.querySelectorAll(`.row-${row}`)[col]
	this.revealed = false
	this.isLocked = false
	this.isMine = false
	this.adjacentMines = 0
}

// Create a 2D array of 225 square objects that form a 15 X 15 grid //
function build2DArray(rows, cols) {
	let arr = new Array(rows)

	for (let i = 0; i < rows; i++) {
		arr[i] = new Array(cols)
	}

	return arr
}

// Create and add cell objects to the 2D grid array //
function setupGrid(rows, cols) {
	let grid = build2DArray(rows, cols)

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			grid[row][col] = new Cell(row, col)
		}
	}

	return grid
}

// Create a function that clears the grid //
function clearGrid(rowLimit, colLimit) {
	for (let row = 0; row < rowLimit; row++) {
		for (let col = 0; col < colLimit; col++) {
			grid[row][col].cellBox.innerHTML = ''
			grid[row][col].cellBox.style.backgroundColor = 'lightgray'
			grid[row][col].isMine = false
			grid[row][col].adjacentMines = 0
		}
	}
}

function startGame() {
	// Set cells border to white so user knows game started //
	cells.forEach((cell) => (cell.style.borderColor = 'white'))

	// Clear grid //
	closeModal()
	clearGrid(15, 15)

	// Create grid objects //
	grid = setupGrid(15, 15)

	let mineCount = 0

	while (mineCount < 30) {
		// Create random number (0-14) //
		let randomRow = Math.floor(Math.random() * 15)
		let randomCol = Math.floor(Math.random() * 15)

		// Set isMine to true for 10 random cells //
		if (grid[randomRow][randomCol].cellBox.innerHTML === '') {
			grid[randomRow][randomCol].isMine = true
			mineCount++
		}
	}

	gameStarted = true
}

function handleClick() {
	if (gameStarted === true) {
		// Grab the object of the cell that was clicked //
		const selectedCell = selectCell(this)

		// Check if cell is locked //
		if (selectedCell.isLocked === false) {
			// Check if user clicked on a mine //
			if (selectedCell.isMine === true) {
				setTimeout(revealMines, 800)
				setTimeout(openLoseModal, 800)

				// Reveal cell if it hasn't already been revealed //
			} else if (selectedCell.revealed !== true) {
				selectedCell.revealed = true

				countAdjacentMines(selectedCell)
			}
		}
	}

	checkWin()
}

function handleRightClick(e) {
	e.preventDefault()

	if (gameStarted == true) {
		// Grab the object of the cell that was clicked //
		const selectedCell = selectCell(this)

		// Check if cell is already revealed //
		if (selectedCell.revealed === false) {
			// Toggle lock/unlock //
			if (selectedCell.isLocked === false) {
				// Add flag to cell //
				const img = document.createElement('img')
				img.classList.add('flag')
				img.src = './images/flag.png'
				img.alt = 'flag'

				selectedCell.isLocked = true
				selectedCell.cellBox.append(img)
			} else {
				// Remove flag //
				selectedCell.isLocked = false
				selectedCell.cellBox.innerHTML = ''
			}

			checkWin()

			return false
		}
	}
}

function selectCell(cell) {
	const cellRow = cell.classList[0].match(/\d+/)
	const cellCol = cell.classList[1].match(/\d+/)

	return grid[cellRow][cellCol]
}

// Create function to count number of mines in adjacent cells //
function countAdjacentMines(cell) {
	// Grab adjacent cell objects //
	let minRow = cell.row - 1 >= 0 ? cell.row - 1 : 0
	let maxRow = cell.row + 1 <= 14 ? cell.row + 1 : 14
	let minCol = cell.col - 1 >= 0 ? cell.col - 1 : 0
	let maxCol = cell.col + 1 <= 14 ? cell.col + 1 : 14

	// Count adjacent cells that contain mines and update cell.adjacentMines //
	for (let x = minRow; x <= maxRow; x++) {
		for (let y = minCol; y <= maxCol; y++) {
			if (grid[x][y].isMine === true) {
				cell.adjacentMines += 1
			}
		}
	}

	// Display adjacentMines count //
	cell.cellBox.style.backgroundColor = 'darkgray'

	if (cell.adjacentMines > 0) cell.cellBox.innerHTML = cell.adjacentMines
	if (cell.adjacentMines === 0) cell.cellBox.innerHTML = ' '
	if (cell.adjacentMines > 3) cell.cellBox.style.color = 'black'
	if (cell.adjacentMines === 3) cell.cellBox.style.color = 'red'
	if (cell.adjacentMines === 2) cell.cellBox.style.color = 'green'
	if (cell.adjacentMines === 1) cell.cellBox.style.color = 'blue'

	cell.revealed = true

	// Reveal neighboring cells that have no mines //
	if (cell.adjacentMines === 0) {
		for (let x = minRow; x <= maxRow; x++) {
			for (let y = minCol; y <= maxCol; y++) {
				if (
					grid[x][y].cellBox.innerHTML === '' &&
					grid[x][y].isMine === false
				) {
					// Recursive function //
					countAdjacentMines(grid[x][y])
				}
			}
		}
	}
}

// Reveal mines //
function revealMines() {
	grid.forEach((row) => {
		row.forEach((cell) => {
			if (cell.isMine === true) {
				// Create and display mines //
				const mine = document.createElement('img')
				mine.classList.add('mine')
				mine.src = 'images/mine.png'

				// Reset cell and append mine //
				cell.cellBox.innerHTML = ''
				cell.cellBox.append(mine)
			}
		})
	})
}

function checkWin() {
	let win = true

	for (const row of grid) {
		for (const cell of row) {
			if (cell.cellBox.innerHTML === '') win = false
		}
	}

	if (win) {
		setTimeout(revealMines, 800)

		openWinModal()

		gameStarted = false

		grid = setupGrid(15, 15)
	}
}

function openWinModal() {
	setTimeout(() => {
		const img = document.createElement('img')
		img.classList.add('victory-banner')
		img.src = './images/victory.png'
		img.alt = 'victory banner'

		gameResultsModal.style.display = 'flex'
		gameResultsModal.append(img)
	}, 1200)
}

function openLoseModal() {
	setTimeout(() => {
		gameResultsModal.style.display = 'flex'
		gameResultsModal.innerHTML = '<h2>SORRY, TRY AGAIN!</h2>'
	}, 1200)
}

function closeModal() {
	gameResultsModal.innerHTML = ''
	gameResultsModal.style.display = 'none'
}

// Game started //
let gameStarted = false

// Build Grid //
let grid = setupGrid(15, 15)

// Set mines and start game //
startGameBtn.addEventListener('click', startGame, false)

for (const cell of cells) {
	// Listen for clicks //
	cell.addEventListener('click', handleClick, false)

	// Listen for right clicks for marking cells //
	cell.addEventListener('contextmenu', handleRightClick, false)

	// Listen for press and hold for mobile devices //
	cell.addEventListener('long-press', handleRightClick, false)
}
