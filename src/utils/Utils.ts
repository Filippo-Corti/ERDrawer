import { Segment } from "./Segment";
import Vector2D from "./Vector2D";

export type ConnectionPoint = {
    p: Vector2D,
    empty: boolean
}


export module Random {

    var seed = 6;
    function random(): number {
        //return Math.random()
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    export function getRandom(min: number, max: number) {
        return Math.floor(random() * (max - min + 1)) + min;
    }

    export function shuffle(array: any[]) {
        var count = array.length,
            randomnumber,
            temp;
        while (count) {
            randomnumber = random() * count-- | 0;
            temp = array[count];
            array[count] = array[randomnumber];
            array[randomnumber] = temp
        }
    }

}

export function containsAny<T>(haystack: T[], needles: T[]): boolean {
    for (const n of needles) {
        if (contains(haystack, n)) return true;
    }
    return false;
}

export function contains<T>(haystack: T[], needle: T): boolean {
    for (const o of haystack) {
        if (typeof (o as any).equals === 'function') {
            if ((o as any).equals(needle)) {
                return true;
            }
        } else {
            if (o == needle) return true;
        }
    }
    return false;
}

export function doBrokenLinesIntersect(line1: Vector2D[], line2: Vector2D[]): boolean {
    for (let i = 0; i < line1.length - 1; i++) {
        const s1 = Segment.fromVectors(line1[i], line1[i + 1]);
        for (let j = 0; j < line2.length - 1; j++) {
            const s2 = Segment.fromVectors(line2[j], line2[j + 1]);
            if (s1.intersects(s2)) {
                return true;
            }
        }
    }
    return false;
}