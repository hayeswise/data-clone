/**
 * Creates a deep clone of the object's data. Any properties begining with an underscore or are functions are
 * ignored.  Additional properties can be ignored by passing in an array of property names to ignore.
 * Only the object's own enumerable properties are considered - properities in the prototype chaine are ignored.
 * @param {Object} obj The object to make a deep data clone.
 * @param {Array} [filter] An optional array of property names to ignore (not copy)
 * @param {Array} [refs] An optional array of object references used to detect circular references.
 *  Typically not used on the first call to the function.
 * @return {Object} An object that is a deep clone of the object's data.
 */
 //@todo: add this as a prototype to Object
 //@todo: provide a minified version
 //@todo: allow ignore to be a single string
 //@todo: allow ignore to be an array of regular expression
function dataClone(obj, filter, depth, refs) {
    "use strict";
    var copy = obj,
        curObjMoniker,
        firstTime,
        keys;
        //name;
    var MAX_DEPTH = 4;
    firstTime = (refs === undefined);
    if (firstTime) {
        refs = new Map();
        curObjMoniker = "self";
        refs.set(obj, curObjMoniker);
    } else {
      curObjMoniker = refs.get(obj);
    }
    if (filter === undefined) {filter = [];}
    if (depth === undefined) {depth = 1;}

    if (depth > MAX_DEPTH) {
       if (obj !== undefined && typeof obj === "object") {
           if (refs.has(obj)) {
               return "{" + typeof obj + ":" + refs.get(obj) + "}";
           } else {
               return "[Max clone depth exceeded]";
           }
       } else {
           return copy;
       }
    }
    if (obj && typeof obj === "object") {
        copy = Object.prototype.toString.call(obj) === "[object Array]" ? [] : Object.create(null);
        keys = Object.keys(obj);
        keys.forEach(function(name) {
            var subDepth = depth;
            if (name.substr(0, 1) !== "_" && typeof copy[name] !== "function" && filter.indexOf(name) === -1) {
                if (!refs.has(obj[name])) {
                    refs.set(obj[name], refs.get(obj) + "." + name);
                }
                subDepth = subDepth + 1;
                copy[name] = dataClone(obj[name], filter, subDepth, refs);
            }
        });
    }
    return copy;
}