import Vector2D from "./Vector2D";

export type ConnectionPoint = {
    p: Vector2D,
    empty: boolean
}


export module Random {

    var seed = 1;
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