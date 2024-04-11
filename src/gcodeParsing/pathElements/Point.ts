export class Point {

    x : number;
    y : number;
    private readonly down : boolean;
    get isDown() {
        return this.down;
    }
    get isUp() {
        return !this.down;
    }

    constructor(x : number, y : number, down : boolean) {
        this.x = x;
        this.y = y;
        this.down = down;
    }

    static fromPoint(other : Point, down: boolean) : Point {
        return new Point(other.x, other.y, down);
    }

    distanceTo(other : Point) {
        return Math.sqrt((this.x - other.x)**2 + (this.y - other.y)**2);
    }

    equals(other : Point) {
        return this.x === other.x && this.y === other.y && this.down === other.down;
    }
}