/*
To-Do:
x Make it so jumps are forced, not allowed to just move
  - Idea:
    x Can pass in a list of possible spaces to move to when moving a piece
    x Check if list is empty
    x Once piece is selected, highlight possible moves in yellow

x Make it so player can deselect pieces before moving
  - Need to make it so player can't do this in the middle of a double jump
    - Can make it so user has to click to the final jump position               (involved, intuitive fix)
      - Can draw line showing the path of moves
    - Can make a flag on the piece determining whether or not user can deselect (easy, dirty fix)

x Add game over functionality
  x Need to tie if neither player can make a valid move
  - Make it obvious what the result of the game is
    - Win/loss/tie in big letters
    - Change color of board

- Allow user to reset game with "r"



- Move functionality:
  - On turn, highlight pieces available to move
    - Piece is available to move if...
      1) has an available move
      2) if it has no available jumps, no other pieces have available jumps
  - Once piece is selected, allow user to deselect by clicking on it again
  - Highlight available moves for the selected piece
    - If piece has available jump(s), do not let piece move 1 diagonal

*/

class CheckerPiece {
  constructor(x, y, p) {
      this.x = x; // x-coordinate (on board) - 0 = left column
      this.y = y; // y-coordinate (on board) - 0 = top row
      this.p = p; // false if opponent, true if player
      this.king = false; // is this piece a king?
  }

  // draw this CheckerPiece on the screen
  draw() {
      this.p ? ctx.fillStyle = "#135224" : ctx.fillStyle = "maroon";
      // 135224 - green
      // D8B94F - yellow
      ctx.beginPath();
      ctx.arc(CELLSIZE * this.x + CELLSIZE * 0.5, CELLSIZE * this.y + CELLSIZE * 0.5, CELLSIZE / 2 - 5, 0, Math.PI * 2);
      ctx.fill();
      if (this == pieceToMove) { // outline selected piece
        ctx.lineWidth = 5;
        this.p ? ctx.strokeStyle = '#003300' : ctx.strokeStyle = '#4B0000';
        ctx.stroke();
      }
      if (this.king) { // show that piece is a king
        ctx.fillStyle = "#ebc334";
        ctx.beginPath();
        ctx.arc(CELLSIZE * this.x + CELLSIZE * 0.5, CELLSIZE * this.y + CELLSIZE * 0.5, CELLSIZE / 5, 0, Math.PI * 2);
        ctx.fill();
      }
  }

  // move this CheckerPiece to the given (x, y) coordinates if move is valid, update board accordingly
  movePiece(x, y) {
    if (!findAvailableMoves(this).some(e => e[0] == x && e[1] == y)) throw "Invalid move!"; // ensures move is valid

    if (Math.abs(this.x - x) == 2) { // if jump
      if (turn) {
        let target = findCheckerPieceAtPos((this.x + x) / 2, (this.y + y) / 2, oppPieces);
        let removeIndex = oppPieces.indexOf(target);
        oppPieces.splice(removeIndex, 1); // remove piece jumped over
      } else {
        let target = findCheckerPieceAtPos((this.x + x) / 2, (this.y + y) / 2, myPieces);
        let removeIndex = myPieces.indexOf(target);
        myPieces.splice(removeIndex, 1); // remove piece jumped over
      }
      tieCounter = 0;
      // update position
      this.x = x;
      this.y = y;
      if (findAvailableJumps(this).length == 0) { // if no more jumps, toggle turn
        turn = !turn;
        pieceToMove = null;
      } else { move = !move; } // if jump available, ensure player is still moving the piece
    } else { // if normal move
      this.x = x;
      this.y = y;
      turn = !turn;
      pieceToMove = null;
    }
    move = !move; // move is over
    tieCounter++;
    if (this.p) { // check if piece should become a king
      if (this.y == 0) this.king = true;
    } else {
      if (this.y == 7) this.king = true;
    }
  }
}








const canvas = document.getElementById("gameArea");
const ctx = canvas.getContext("2d");

canvas.height = 700;
canvas.width = 700;

const CELLSIZE = canvas.height / 8;
const RADIUS = CELLSIZE / 2 - 5;
var turn = true;
var move = false;
var tieCounter = 0;

// initialize list of oppPieces
const oppPieces = [];
for (let i = 0; i < 4; i++) {
  oppPieces[i] = new CheckerPiece(i * 2 + 1, 0, false);
}
for (let i = 0; i < 4; i++) {
  oppPieces[i + 4] = new CheckerPiece(i * 2, 1, false);
}

// initialize list of myPieces
const myPieces = [];
for (let i = 0; i < 4; i++) {
  myPieces[i] = new CheckerPiece(i * 2 + 1, 6, true);
}
for (let i = 0; i < 4; i++) {
  myPieces[i + 4] = new CheckerPiece(i * 2, 7, true);
}


// draw the game
function drawGame() {
  clearScreen();
  drawPieces();
  move ? drawAvailableMoves() : drawAvailablePieces();
}

// draw the base game board with no pieces on it
function clearScreen() {
  ctx.fillStyle = "#e6d5aa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 8; i++) {     // rows
    for (let j = 0; j < 8; j++) {   // cols
        if ((j + i) % 2 == 1) {
            ctx.fillStyle = "#229c5d";
            ctx.fillRect(j * CELLSIZE, i * CELLSIZE, CELLSIZE, CELLSIZE);
        } // 229c5d
    }     // 195D8B
  }
}

// draw all of the pieces on the board
function drawPieces() {
  for (let i = 0; i < oppPieces.length; i++) {
    oppPieces[i].draw();
  }
  for (let i = 0; i < myPieces.length; i++) {
    myPieces[i].draw();
  }
}

// if a piece is selected, highlight the spaces where it can be moved
function drawAvailableMoves() {
  if (pieceToMove != null) { // highlight available spaces for selected piece to move to
    let spaces = findAvailableMoves(pieceToMove);
    for (let i = 0; i < spaces.length; i++) {
      let xy = spaces[i];
      let x = xy[0];
      let y = xy[1];
      ctx.fillStyle = "#38cf9f";
      ctx.fillRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE);
    }
  }
}

// highlight pieces available to move
function drawAvailablePieces() {
  let pieces;
  turn ? pieces = findAvailablePieces(myPieces) : pieces = findAvailablePieces(oppPieces);
  for (let i = 0; i < pieces.length; i++) {
    let cp = pieces[i];
    let x = cp.x;
    let y = cp.y;
    ctx.fillStyle = "#38cf9f";
    ctx.beginPath();
    ctx.arc(CELLSIZE * x + CELLSIZE * 0.5, CELLSIZE * y + CELLSIZE * 0.5, CELLSIZE / 8 - 5, 0, Math.PI * 2);
    ctx.fill();
  }
}


var mouseX, mouseY; // the position of the mouse pointer on the web page
var pieceToMove; // the CheckerPiece that is currently selected to be moved

// read inputs whenever mouse click detected
document.body.addEventListener("click", inputs);

// find position of mouse relative to the board
function findMousePos() {
    document.onmousemove = function(e) {
        var rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }
}

// handles user input for the game
function inputs() {
  let pieces;
  findMousePos(); // update positions
  let x1 = Math.floor(mouseX / CELLSIZE); // x-value of the cell clicked
  let y1 = Math.floor(mouseY / CELLSIZE); // y-value of the cell clicked
  if (x1 >= 0 && x1 < 8 && y1 >= 0 && y1 < 8) { // if user clicks on the board
    if (!move) { // select piece to be moved
      turn ? pieces = myPieces : pieces = oppPieces;
      try {
        pieceToMove = findCheckerPieceAtPos(x1, y1, pieces);
        if (!findAvailablePieces(pieces).includes(pieceToMove) && 1) throw "Cannot move this piece!";
        console.log("Select: [", x1, ",", y1, "]");
        move = !move;
        drawGame();
      } catch (error) { // selected piece/space not valid
        pieceToMove = null;
        console.error(error);
      }
    } else { // move piece
      turn ? pieces = myPieces : pieces = oppPieces;
      try {
        if (findCheckerPieceAtPos(x1, y1, pieces) == pieceToMove) { // deselect piece
          pieceToMove = null;
          move = !move;
        }
      } catch(error) { // move piece
        movePiece(pieceToMove, x1, y1);
      }
    }
    drawGame();
  }
  checkGameOver(); // check if the game is over after move
}

function movePiece(pieceToMove, x1, y1) {
  try {
    pieceToMove.movePiece(x1, y1);
    console.log("Move to: [", x1, ",", y1, "]");
  } catch (error) { console.error(error); }
}


// return the CheckerPiece at a specified (x, y) in a given list of pieces, throw error if no piece at location
function findCheckerPieceAtPos(x, y, pieces) {
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].x == x && pieces[i].y == y) {
            return pieces[i];
        }
    }
    throw "Bad piece selection!";
}

// is there an empty space here? (given (x, y) on board)
function emptySpace(x, y) {
    try {
      findCheckerPieceAtPos(x, y, oppPieces);
      return false;
    } catch(error) {}

    try {
      findCheckerPieceAtPos(x, y, myPieces);
      return false;
    } catch (error) {}

    return true;
}

// what tiles are open to jump to with this CheckerPiece?
function findAvailableJumps(cp) {
  const spaces = [];
  if (turn || cp.king) {
    if (validMove(cp, cp.x - 2, cp.y - 2)) spaces.push([cp.x - 2, cp.y - 2]);
    if (validMove(cp, cp.x + 2, cp.y - 2)) spaces.push([cp.x + 2, cp.y - 2]);
  }
  if (!turn || cp.king) {
    if (validMove(cp, cp.x - 2, cp.y + 2)) spaces.push([cp.x - 2, cp.y + 2]);
    if (validMove(cp, cp.x + 2, cp.y + 2)) spaces.push([cp.x + 2, cp.y + 2]);
  }
  return spaces;
}

// what tiles are open to move to with this CheckerPiece?
function findAvailableMoves(cp) {
  let spaces = [];
  if (findAvailableJumps(cp).length > 0) return findAvailableJumps(cp);
  if (turn || cp.king) {
    if (validMove(cp, cp.x - 1, cp.y - 1)) spaces.push([cp.x - 1, cp.y - 1]);
    if (validMove(cp, cp.x + 1, cp.y - 1)) spaces.push([cp.x + 1, cp.y - 1]);
  }
  if (!turn || cp.king) {
    if (validMove(cp, cp.x - 1, cp.y + 1)) spaces.push([cp.x - 1, cp.y + 1]);
    if (validMove(cp, cp.x + 1, cp.y + 1)) spaces.push([cp.x + 1, cp.y + 1]);
  }
  let jumps = findAvailableJumps(cp);
  spaces = spaces.concat(jumps);
  return spaces;
}

// is this tile a valid move for the piece to make?
function validMove(cp, x, y) {
  // is the spot on the board?
  if (x < 0 || x > 7 || y < 0 || y > 7) return false;

  // is the landing spot empty?
  if (!emptySpace(x, y)) return false;

  // is the spot a valid position from the selected piece?
  if (cp.king) {
    if (Math.abs(cp.x - x) == 1 && Math.abs(cp.y - y) == 1) { return true; }
    else if (Math.abs(cp.x - x) == 2 && Math.abs(cp.y - y) == 2) {
      try {
        if (turn) { let target = findCheckerPieceAtPos((cp.x + x) / 2, (cp.y + y) / 2, oppPieces); }
        else { let target = findCheckerPieceAtPos((cp.x + x) / 2, (cp.y + y) / 2, myPieces); }
        return true;
      } catch (error) { return false; }
    } else { return false; }
  } else {
    if (turn) {
      // moving up board (negative y direction)
        if (Math.abs(cp.x - x) == 1 && cp.y - y == 1) { // one diagonal away
          return true;
        } else if (Math.abs(cp.x - x) == 2 && cp.y - y == 2) { // two diagonals away
          try {
            // check if piece can be jumped over
            let target = findCheckerPieceAtPos((cp.x + x) / 2, cp.y - 1, oppPieces);
            return true;
          } catch (error) {
            return false;
          }
        } else {
          return false;
        }
    } else {
      // moving down board (positive y direction)
      if (Math.abs(cp.x - x) == 1 && y - cp.y == 1) { // one diagonal away
        return true;
      } else if (Math.abs(cp.x - x) == 2 && y - cp.y == 2) { // two diagonals away
        try {
          // check if piece can be jumped over
          let target = findCheckerPieceAtPos((cp.x + x) / 2, cp.y + 1, myPieces);
          return true;
        } catch (error) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
}


// find the pieces in the list that can be selected (have available move or must have available jump if one has a jump)
function findAvailablePieces(pieces) {
  const movePieces = [];
  let jump = false;
  // add pieces with available moves to list
  for (let i = 0; i < pieces.length; i++) {
    if (findAvailableMoves(pieces[i]).length > 0) movePieces.push(pieces[i]);
    if (findAvailableJumps(pieces[i]).length > 0) jump = true;
  }
  // if one piece has jump, remove pieces from list that don't also have a jump
  if (jump) {
    for (let i = movePieces.length - 1; i >= 0; i--) {
      if (findAvailableJumps(movePieces[i]).length == 0) movePieces.splice(i, 1);
    }
  }
  return movePieces;
}


// is the game over? (win/loss/tie)
function checkGameOver() {
  if (myPieces.length == 0) {
    pieceToMove = null;
    console.log("LOSS");
    oppPieces.splice(0, oppPieces.length);
    setTimeout(drawGame, 1000);
  } else if (oppPieces.length == 0) {
    pieceToMove = null;
    console.log("WIN");
    myPieces.splice(0, myPieces.length);
    setTimeout(drawGame, 1000);
  } else if (tieCounter >= 100) {
    pieceToMove = null;
    console.log("100 moves without a capture: TIE")
    oppPieces.splice(0, oppPieces.length);
    myPieces.splice(0, myPieces.length);
    setTimeout(drawGame, 1000);
  } else {
    let noMoves = true;
    for (let i = 0; i < myPieces.length; i++) {
      if (findAvailableMoves(myPieces[i]).length > 0) {
        noMoves = false;
        break;
      }
    }
    if (noMoves) {
      for (let i = 0; i < oppPieces.length; i++) {
        if (findAvailableMoves(oppPieces[i]).length > 0) {
          noMoves = false;
          break;
        }
      }
    }
    if (noMoves) {
      pieceToMove = null;
      console.log("No moves available: TIE") // else if no more moves available -> TIE
      oppPieces.splice(0, oppPieces.length);
      myPieces.splice(0, myPieces.length);
      setTimeout(drawGame, 1000);
    }
  }
}


// display the game
drawGame();