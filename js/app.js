'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = ' <img src="img/glue.png" >'

// Model:
var gBoard
var gGamerPos
var gNumBallCollected = 0
var gBallAdded = 2
var addBallInterval
var addGlueInterval
var eatSound = new Audio('sounds/movement-swipe-whoosh-3-186577.mp3')
var isGlue

function onInitGame() {
	document.querySelector('.reset').style.display = 'none'
	gGamerPos = { i: 2, j: 9 }
	gBoard = buildBoard()
	renderBoard(gBoard)
	addBallInterval = setInterval(addBall, 4000)
	addGlueInterval = setInterval(addGlue, 5000)

}

function buildBoard() {
	// Create the Matrix 10 * 12 
	const board = createMat(10, 12)
	// Put FLOOR everywhere and WALL at edges 
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			board[i][j] = { type: FLOOR, gameElement: null }
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				board[i][j].type = WALL
			}
		}
	}
	console.log('Math.floor(board.length / 2):', Math.floor(board.length / 2));
	console.log('Math.floor(board.length[0] / 2:', Math.floor(board[0].length / 2));

	board[0][Math.floor(board[0].length / 2)].type = FLOOR
	board[board.length - 1][Math.floor(board[0].length / 2)].type = FLOOR
	board[Math.floor(board[0].length / 2)][0].type = FLOOR
	board[Math.floor(board[0].length / 2)][board[0].length - 1].type = FLOOR

	// Place the gamer and two balls
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

	board[2][4].gameElement = BALL
	board[7][6].gameElement = BALL
	console.log(board)
	return board
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = ''
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>'
		for (var j = 0; j < board[0].length; j++) {
			const currCell = board[i][j] // {type,gameElement}

			var cellClass = getClassName({ i: i, j: j }) // 'cell-0-0'

			if (currCell.type === FLOOR) cellClass += ' floor' // 'cell-0-0 floor'
			else if (currCell.type === WALL) cellClass += ' wall' // 'cell-0-0 wall'

			strHTML += '<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >'

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG
			}

			strHTML += '</td>'
		}
		strHTML += '</tr>'
	}

	const elBoard = document.querySelector('.board')
	elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
	if (!isGlue) {

		console.log('i, j:', i, j)
		if (i === -1) i = i + gBoard.length
		else if (i === gBoard.length) i = 0
		else if (j === -1) j += gBoard[0].length
		else if (j === gBoard[0].length) j = 0

		var targetCell = gBoard[i][j]
		console.log('targetCell:', targetCell);



		if (targetCell.type === WALL) return

		// Calculate distance to make sure we are moving to a neighbor cell
		const iAbsDiff = Math.abs(i - gGamerPos.i) // 1 ,2..
		const jAbsDiff = Math.abs(j - gGamerPos.j) // 1 ,7...
		// console.log('iAbsDiff:', iAbsDiff);
		// console.log('jAbsDiff:', jAbsDiff);

		// If the clicked Cell is one of the four allowed
		if ((iAbsDiff === 1 && jAbsDiff === 0) || (iAbsDiff === gBoard.length - 1 && jAbsDiff === 0) || (jAbsDiff === gBoard[0].length - 1 && iAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
			console.log('MOVE')
			document.querySelector('h1').innerText = `Number of neighboring balls: ${countBalls(i, j, gBoard)}`
			if (targetCell.gameElement === BALL) {
				console.log('Collecting!')
				gNumBallCollected++
				eatSound.play()
				console.log('gNumBallCollected:', gNumBallCollected);
				console.log('gBallAdded:', gBallAdded);
				if (gBallAdded === gNumBallCollected) {

					clearInterval(addBallInterval)
					clearInterval(addGlueInterval)
					document.querySelector('.reset').style.display = 'block'
				}
			}
			else if (targetCell.gameElement === GLUE) {
				isGlue = true
				setTimeout(() => {
					isGlue = false
				}, 3000)
			}

			// Move the gamer
			// Moving from current position:
			// Model:
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = null

			// Dom:
			renderCell(gGamerPos, '')

			// Moving to selected position:
			// Model:
			gBoard[i][j].gameElement = GAMER
			gGamerPos.i = i
			gGamerPos.j = j

			// Dom:
			renderCell(gGamerPos, GAMER_IMG)


		} else console.log('TOO FAR', iAbsDiff, jAbsDiff)

	}
}


function addBall() {
	var pos = findEmptyPos(gBoard)
	// console.log('pos:', pos);
	gBoard[pos.i][pos.j].gameElement = BALL
	gBallAdded++
	renderCell(pos, BALL_IMG)
	document.querySelector('h1').innerText = `Number of neighboring balls: ${countBalls(gGamerPos.i, gGamerPos.j, gBoard)}`

}

function addGlue() {
	var pos = findEmptyPos(gBoard)
	// console.log('pos:', pos);
	gBoard[pos.i][pos.j].gameElement = GLUE
	renderCell(pos, GLUE_IMG)
	setTimeout(() => {
		if (!isGlue) {

			gBoard[pos.i][pos.j].gameElement = null
			renderCell(pos, null)
		}

	}, 3000)
}

// function removeGlue(pos) {



// }

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	const cellSelector = '.' + getClassName(location)
	const elCell = document.querySelector(cellSelector)
	elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
	// console.log('event:', event)
	const i = gGamerPos.i // 2
	const j = gGamerPos.j // 9

	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1)
			break
		case 'ArrowRight':
			moveTo(i, j + 1)
			break
		case 'ArrowUp':
			moveTo(i - 1, j)
			break
		case 'ArrowDown':
			moveTo(i + 1, j)
			break
	}
}

// Returns the class name for a specific cell
function getClassName(location) { // {i:2,j:4}
	const cellClass = `cell-${location.i}-${location.j}` // 'cell-2-4'
	return cellClass
}