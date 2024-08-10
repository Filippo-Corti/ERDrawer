
export module Random {

    var seed = 0;
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