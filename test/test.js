var obj = {
    a: {
        a1: 1,
        a2: "atwo"
    },
    b: {
        b1: 1,
        b2: new Date()
    }
};
obj.a.more_b = obj.b;
obj.b.more_a = obj.a;
var expected = {"a":{"a1":1,"a2":"atwo","more_b":"{object:self.a.more_b}"},"b":{"b1":1,"b2":"2017-02-04T21:46:24.782Z","more_a":"{object:self.a}"}};
expected.b.b2 = obj.b.b2.toISOString();
//var s = JSON.stringify(obj);
//=> Uncaught TypeError: Converting circular structure to JSON
//     at JSON.stringify (<anonymous>)

WISE.dataClone.MAX_DEPTH = 2
var dc = WISE.dataClone(obj);
var s = JSON.stringify(dc);
console.log(s);
console.log(s == JSON.stringify(expected)); // true