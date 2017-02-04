# data-clone
Creates a deep clone of the object's data.  The resultant object and any contained objects are based on an object 
with no properties (a null object).  By default, any properties begining with an underscore or are functions are 
ignored. Only the object's own enumerable properties are considered - properities in the prototype chain are ignored.
The ignored types and ignored propertiescan be changed by pushing new values into, or completely replacing the values
of, properites IGNORE_TYPES and IGNORE_PROPERTY_NAMES respectively.

# Usage
```
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
obj.a.more_a = obj.a;
obj.b.more_a = obj.a;

//var s = JSON.stringify(obj);
//=> Uncaught TypeError: Converting circular structure to JSON
//     at JSON.stringify (<anonymous>)

dataClone.MAX_DEPTH = 2
var dc = dataClone(obj);
s = JSON.stringify(dc);
//=> {
//  "a": {
//    "a1": 1,
//    "a2": "atwo",
//    "more_a": {
//      "a1": 1,
//      "a2": "atwo",
//      "more_a": {
//        "a1": 1,
//        "a2": "atwo",
//        "more_a": "{object:self.a}"
//      }
//    }
//  },
//  "b": {
//    "b1": 1,
//    "b2": "2017-02-01T07:47:11.556Z",
//    "more_a": {
//      "a1": 1,
//      "a2": "atwo",
//      "more_a": {
//        "a1": 1,
//        "a2": "atwo",
//        "more_a": "{object:self.a}"
//      }
//    }
//  }
//}
```

# Documentation
See [dataClone API](https://github.com/hayeswise/data-clone/blob/master/docs/dataClone.md).

# License
MIT License

(c) 2017 Brian S Hayes ("Hayeswise")
