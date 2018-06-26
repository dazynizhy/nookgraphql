/*
fizzbuzz(n)
n/3 -> "fizz"
n/5 -> "buzz"
n/3 && n/5 -> "fizzbuzz"

else -> "n"

*/
module.exports = (n) => {
    if(n % 3 === 0) {
        return 'fizz'
    }
    return `${n}`
}