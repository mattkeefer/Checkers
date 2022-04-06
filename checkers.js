/*
To-Do:
- Make it so double jumps are forced, not allowed to just move
  - Idea:
    - Can pass in a list of possible spaces to move to when moving a piece
    - Check if list is empty
    - Once piece is selected, highlight possible moves in yellow

- Make it so player can deselect pieces before moving
  - Need to make it so player can't do this in the middle of a double jump
    - Can make it so user has to click to the final jump position               (involved, intuitive fix)
      - Can draw line showing the path of moves
    - Can make a flag on the piece determining whether or not user can deselect (easy, dirty fix)

- Add game over functionality

- Add in backwards moving pieces
  - Can add flag to pieces for drawing/moving
*/

class CheckerPiece {
  constructor(x, y, p) {
      this.x = x; // x-coordinate (on board) - 0 = left column
      this.y = y; // y-coordinate (on board) - 0 = top row
      this.p = p; // false if opponent, true if player
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
  }

  // move this CheckerPiece to the given (x, y) coordinates if move is valid, update board accordingly
  movePiece(x, y) {
    if (turn) {

      if (validMove(this, x, y)) { // if move is valid
        if (Math.abs(this.x - x) == 2) { // if jump
          let target = findCheckerPieceAtPos(Math.abs(this.x + x) / 2, this.y - 1, oppPieces);
          let removeIndex = oppPieces.indexOf(target);
          oppPieces.splice(removeIndex, 1); // remove piece jumped over
          // update position
          this.x = x;
          this.y = y;
          if (findAvailableJumps(this).length == 0) { // if no more jumps, toggle turn
            turn = !turn;
            pieceToMove = null;
          } else {
            move = !move;
          }
        } else { // if normal move
          this.x = x;
          this.y = y;
          turn = !turn;
          pieceToMove = null;
        }
      } else {
        throw "Invalid move"
      }

    } else {
      if (validMove(this, x, y)) { // if move is valid
        if (Math.abs(this.x - x) == 2) { // if jump
          let target = findCheckerPieceAtPos(Math.abs(this.x + x) / 2, this.y + 1, myPieces);
          let removeIndex = myPieces.indexOf(target);
          myPieces.splice(removeIndex, 1); // remove piece jumped over
          tieCounter = 0;
          // update position
          this.x = x;
          this.y = y;
          if (findAvailableJumps(this).length == 0) { // if no more moves, toggle turn
            turn = !turn;
            pieceToMove = null;
          } else {
            move = !move;
          }
        } else { // if normal move
          this.x = x;
          this.y = y;
          turn = !turn;
          pieceToMove = null;
        }
      } else {
        throw "Invalid move"
      }
    }
    move = !move; // move is over
    tieCounter++;
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
}

var mouseX, mouseY;
var pieceToMove;

function inputs() {
  // update positions
  findMousePos();
  let x1 = Math.floor(mouseX / CELLSIZE);
  let y1 = Math.floor(mouseY / CELLSIZE);
  if (x1 >= 0 && x1 < 8 && y1 >= 0 && y1 < 8) {
    if (!move) {
      // select piece to be moved
      try {
        turn ? pieceToMove = findCheckerPieceAtPos(x1, y1, myPieces) : pieceToMove = findCheckerPieceAtPos(x1, y1, oppPieces);
        console.log("Select:", x1, y1);
        //if (findAvailableMoves(pieceToMove).length == 0) throw "No moves available for this piece!"
        move = !move;
        drawGame();
      } catch (error) {
        // selected piece/space not valid
        console.error(error);
      }
    } else {
      // move piece
      try {
        if (turn) {
          if (findCheckerPieceAtPos(x1, y1, myPieces) == pieceToMove) {
            pieceToMove = null;
            move = !move;
          }
        } else {
          if (findCheckerPieceAtPos(x1, y1, oppPieces) == pieceToMove) {
            pieceToMove = null;
            move = !move;
          }
        }
      } catch(error) {
        movePiece(pieceToMove, x1, y1);
      }
    }
    drawGame();
  }
  checkGameOver(); // check if the game is over after move
}

function movePiece(pieceToMove, x1, y1) {
  try {
    turn ? pieceToMove.movePiece(x1, y1) : pieceToMove.movePiece(x1, y1);
    console.log("Move to:", x1, y1);
  } catch (error) {
    console.error(error);
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
  if (pieceToMove != null) { // highlight available spaces for selected piece to move to
    let spaces = findAvailableMoves(pieceToMove);
    for (let i = 0; i < spaces.length; i++) {
      let xy = spaces[i];
      let x = xy[0];
      let y = xy[1];
      ctx.strokeStyle = "#d6c41c";
      ctx.strokeRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE);
    }
  }
}

// read inputs whenever mouse click detected
document.body.addEventListener("click", inputs);

// find position of mouse relative to canvas
function findMousePos() {
    document.onmousemove = function(e) {
        var rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }
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
  if (turn) {
    if (validMove(cp, cp.x - 2, cp.y - 2)) spaces.push([cp.x - 2, cp.y - 2]);
    if (validMove(cp, cp.x + 2, cp.y - 2)) spaces.push([cp.x + 2, cp.y - 2]);
  } else {
    if (validMove(cp, cp.x - 2, cp.y + 2)) spaces.push([cp.x - 2, cp.y + 2]);
    if (validMove(cp, cp.x + 2, cp.y + 2)) spaces.push([cp.x + 2, cp.y + 2]);
  }
  return spaces;
}

// what tiles are open to move to with this CheckerPiece?
function findAvailableMoves(cp) {
  const spaces = [];
  if (turn) {
    if (validMove(cp, cp.x - 1, cp.y - 1)) spaces.push([cp.x - 1, cp.y - 1]);
    if (validMove(cp, cp.x + 1, cp.y - 1)) spaces.push([cp.x + 1, cp.y - 1]);
    if (validMove(cp, cp.x - 2, cp.y - 2)) spaces.push([cp.x - 2, cp.y - 2]);
    if (validMove(cp, cp.x + 2, cp.y - 2)) spaces.push([cp.x + 2, cp.y - 2]);
  } else {
    if (validMove(cp, cp.x - 1, cp.y + 1)) spaces.push([cp.x - 1, cp.y + 1]);
    if (validMove(cp, cp.x + 1, cp.y + 1)) spaces.push([cp.x + 1, cp.y + 1]);
    if (validMove(cp, cp.x - 2, cp.y + 2)) spaces.push([cp.x - 2, cp.y + 2]);
    if (validMove(cp, cp.x + 2, cp.y + 2)) spaces.push([cp.x + 2, cp.y + 2]);
  }
  return spaces;
}

// is this tile a valid move for the piece to make?
function validMove(cp, x, y) {
  // is the spot on the board?
  if (x < 0 || x > 7 || y < 0 || y > 7) return false;

  // is the landing spot empty?
  if (!emptySpace(x, y)) return false;

  // is the spot a valid position from the selected piece?
  if (turn) {
    // moving up board (negative y direction)
      if (Math.abs(cp.x - x) == 1 && cp.y - y == 1) { // one diagonal away
        return true;
      } else if (Math.abs(cp.x - x) == 2 && cp.y - y == 2) { // two diagonals away
        try {
          // check if piece can be jumped over
          let target = findCheckerPieceAtPos(Math.abs(cp.x + x) / 2, cp.y - 1, oppPieces);
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
        let target = findCheckerPieceAtPos(Math.abs(cp.x + x) / 2, cp.y + 1, myPieces);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }
}


// is the game over? (win/loss/tie)
function checkGameOver() {
  if (myPieces.length == 0) {
    pieceToMove = null;
    console.log("LOSS");
    oppPieces.splice(0, oppPieces.length);
    setTimeout(drawGame, 2000);
  } else if (oppPieces.length == 0) {
    pieceToMove = null;
    console.log("WIN");
    myPieces.splice(0, myPieces.length);
    setTimeout(drawGame, 2000);
  } else if (tieCounter >= 100) {
    pieceToMove = null;
    console.log("100 moves without a capture: TIE") // else if no more moves available -> TIE
    oppPieces.splice(0, oppPieces.length);
    myPieces.splice(0, myPieces.length);
    setTimeout(drawGame, 2000);
  } // else if no more moves available
}

drawGame();