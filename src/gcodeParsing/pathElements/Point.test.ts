import {Point} from "src/gcodeParsing/pathElements/Point.ts";

describe('Point', () => {

    let point: Point;
    let sameCoordinatesPoint: Point;
    let otherPoint: Point;

    beforeEach(() => {
        point = new Point(0, 0, true);
        sameCoordinatesPoint = new Point(0, 0, true);
        otherPoint = new Point(10, 10, true);
    });

    test('distanceTo', () => {
        const distance = point.distanceTo(otherPoint);
        expect(distance).toBe(Math.sqrt(200));
    });

    test('equals', () => {
        expect(point.equals(sameCoordinatesPoint)).toBeTruthy();
    });

    test('fromPoint', () => {
        const newPoint = Point.fromPoint(point, false);
        expect(newPoint.isDown).toBeFalsy();
        expect(newPoint.x).toBe(point.x);
        expect(newPoint.y).toBe(point.y);
    });

    test('isDown', () => {
        expect(point.isDown).toBeTruthy();
    });

    test('isUp', () => {
        expect(point.isUp).toBeFalsy();
    });
})