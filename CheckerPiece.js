export class CheckerPiece {
    constructor(x, y, p) {
        this.x = x; // x-coordinate (on board) - 0 = left column
        this.y = y; // y-coordinate (on board) - 0 = top row
        this.p = p; // false if p1, true if p2
    }

    draw(ctx, CELLSIZE) {
        this.p ? ctx.fillStyle = "#135224" : ctx.fillStyle = "#D8B94F";
        // 135224 - green
        // D8B94F - yellow
        ctx.beginPath();
        ctx.arc(CELLSIZE * x + CELLSIZE * 0.5, CELLSIZE * y + CELLSIZE * 0.5, CELLSIZE / 2 - 5, 0, Math.PI * 2);
        ctx.fill();
    }
}