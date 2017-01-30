/**
 * Creates a deep clone of the object's data. Any properties begining with an underscore or are functions are 
 * ignored.  Additional properties can be ignored by passing in an array of property names to ignore.
 * Only the object's own enumerable properties are considered - properities in the prototype chaine are ignored.
 * @param {Object} obj The object to make a deep data clone.
 * @param {Array} [ignore] An optional array of property names to ignore (not copy)
 * @param {Array} [refs] An optional array of object references used to detect circular references.  
 *  Typicall not used on the first call to the function.
 * @return {Object} An object that is a deep clone of the object's data.
 */
 //@todo: change refs into a map
 //@todo: add this as a prototype to Object
 //@todo: provide a minified version
 //@todo: allow ignore to be a single string
 //@todo: allow ignore to be an array of regular expression
 //@todo: limit recursion to n levels -- var cloner = New Cloner(ignore <String|[]String>, levels <Number=10>)
function dataClone(obj, ignore, depth, refs) {
    var copy = obj,
        firstTime,
        name,
        clone,
        keys;
    firstTime = (typeof refs === 'undefined')
    if (firstTime) {
        refs = []; // = new Map();
                   // curObjMoniker = "self" 
                   // refs.set(obj, curObjMoniker);
    } else {
      // curObjMoniker = refs.get(obj);
    }
    if (typeof ignore === 'undefined') {
        ignore = [];
    }
    if (typeof depth === 'undefined') {
      depth = 1
    }
    console.log("ignore=" + JSON.stringify(ignore));
    if (obj && typeof obj === 'object') {
        copy = Object.prototype.toString.call(obj) === '[object Array]' ? [] : Object.create(null);
        refs.push(obj); // with a map, don't push since it's already been added to the map
        keys = Object.keys(obj);
        for (var k = 0; k < keys.length; k++) {
            name = keys[k];
            if (name.substr(0, 1) !== "_" && typeof copy[name] !== "function" && ignore.indexOf(name) === -1) {
                if (refs.indexOf(obj[name] === -1 || obj === obj[name]) { // !refs.has(obj[name])
                    // refs.set(obj, curObjMoniker + "." + name)
                    if (depth < MAX_DEPTH) {
                       copy[name] = deepDataClone(obj[name], ignore, depth, refs);
                    } else {
                       copy[name] = "[Max Clone Depth Exceeded]"; // or "{Object:" + refs.get(obj[name]) + "}" if obj === obj[name]
                    }
                } else {
                    copy[name] = "[Circurlar Reference]"; // = "{Object:" + refs.get(obj[name]) + "}"
                }
            }
        }
    }
    return copy;
}
