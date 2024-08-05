
export module Random {

    var seed = 10;
    function random() : number {
        //return Math.random()
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
    
    export function getRandom(min: number, max: number) {
        return Math.floor(random() * (max - min + 1)) + min;
    } 

}