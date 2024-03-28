export class Point {

    x : number;
    y : number;
    down : boolean;

    constructor(x : number, y : number, down : boolean) {
        this.x = x;
        this.y = y;
        this.down = down;
    }

    distanceTo(other : Point) {
        return Math.sqrt((this.x - other.x)**2 + (this.y - other.y)**2);
    }
}