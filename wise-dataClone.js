// MIT License, Copyright (c) 2017 Brian S Hayes ("Hayeswise")
// For more information, visit https://github.com/hayeswise/data-clone
/**
 * WISE namespace for code develped by Brian S Hayes ("Hayeswise").
 * @namespace
 */
var WISE = WISE || {};
/**
 * Creates a deep clone of the object's data.  The resultant object and any contained objects are based on an object
 * with no properties (a null object).  By default, any properties begining with an underscore or are functions are
 * ignored. Only the object's own enumerable properties are considered - properities in the prototype chain are ignored.
 * The ignored types and ignored propertiescan be changed by pushing new values into, or completely replacing the values
 * of, properites IGNORE_TYPES and IGNORE_PROPERTY_NAMES respectively.
 * @property MAX_DEPTH {Number} Set this to a positive number greater than or equal to 1.  Default value is 5.
 *  If the value is invalid, MAX_DEPTH is set to the default value.
 * @property IGNORE_TYPES {String[]} Array of JavaScript types to ignore.  Default value is ["function"].
 * @property IGNORE_PROPERTY_NAMES {String[]} Array of regular expressions to specify which object property
 *  names to ignore.  Default value is ["^_"] which is to ignore any properties beginning with an underscore.
 * @property OBJECT_REFERENCE_FORMAT {String} A sprintf style string used to create a textual representation of an object
 *  reference.  E.g., "{object:self.address}".  The default value is "{object:%s}".
 * @property SELF {String} The text to use in an object reference to the root object.  Default is "self".  This value will
 *  appear in object references when the MAX_DEPTH is reached.  e.g. "{object:self.father}"
 * @param {Object} obj The object to make a deep data clone of.
 * @param {Number} [depth] An optional current cloning depth value.  Typically not used by the intial caller. The
 *  function is recursive and calls its self with this parameter.
 * @param {Map} [refs] An optional map of object-to-object-paths used to track circular references. The map is keyed
 *  with an object and the stored values is a dot notation string representing the path to the object (e.g.,
 *  "self.firstName"). Typically not used by the intial caller. The function is recursive and calls its self with this
 *  parameter.
 * @return {Object} An object that is a deep "data" clone of the object's data.
 * @author Brian S Hayes ("Hayeswise")
 * @license MIT
 * @see {@link https://github.com/hayeswise/data-clone}
 */
WISE.dataClone = (function () {
    "use strict";
    function dataClone(obj, depth, refs) {
        var copy = obj;
        var curObjMoniker; // E.g. "self.address"
        var keys; // Object keys
        if (typeof dataClone.MAX_DEPTH !== "number" || dataClone.MAX_DEPTH < 1) {
            console.warn("Invalid value for dataClone.MAX_DEPTH (" + dataClone.MAX_DEPTH + "). Will use the default value.");
            dataClone.MAX_DEPTH = 5;
        }
        if (refs === undefined) {
            refs = new Map();
            curObjMoniker = dataClone.SELF;
            refs.set(obj, curObjMoniker);
        } else {
            curObjMoniker = refs.get(obj);
        }
        if (!depth || depth < 1) {
            depth = 1;
        }
        if (depth > dataClone.MAX_DEPTH) {
            if (obj !== undefined && typeof obj === "object") {
                switch (Object.prototype.toString.call(obj)) {
                case "[object Date]":
                    return obj.toISOString();
                case "[object RegExp]":
                    return obj.toString();
                case "[object Error]":
                    return {
                        name: obj.name,
                        message: obj.message
                    };
                default:
                    // In the case of recursion, refs will minimally have the object that dataClone was called with.
                    // deprecated: return "{" + typeof obj + ":" + refs.get(obj) + "}";
                    return dataClone.OBJECT_REFERENCE_FORMAT.replace("%s", refs.get(obj));
                }
            } else {
                return obj;
            }
        }
        if (obj && typeof obj === "object") { // handles Map, Set, Int*Array, Uint*Array etc. as well
            switch (Object.prototype.toString.call(obj)) {
            case "[object Date]":
                copy = obj.toISOString();
                break;
            case "[object RegExp]":
                copy = obj.toString();
                break;
            case "[object Error]":
                copy = {
                    name: obj.name,
                    message: obj.message
                };
                break;
            default:
                copy = (Object.prototype.toString.call(obj) === "[object Array]")
                    ? []
                    : Object.create(null);
                keys = Object.keys(obj);
                keys.forEach(function (name) {
                    var ignoreThis;
                    ignoreThis = dataClone.IGNORE_TYPES.some(function (type) {
                        return (type === typeof copy[name]);
                    }) || dataClone.IGNORE_PROPERTY_NAMES.some(function (regexp) {
                        return (new RegExp(regexp).test(name));
                    });
                    if (!ignoreThis) {
                        if (!refs.has(obj[name])) {
                            refs.set(obj[name], refs.get(obj) + "." + name);
                        }
                        copy[name] = dataClone(obj[name], (depth + 1), refs);
                    }
                });
            }
        }
        return copy;
    }
    dataClone.MAX_DEPTH = 4;
    dataClone.IGNORE_TYPES = ["function"];
    dataClone.IGNORE_PROPERTY_NAMES = [/^_/]; //regexp
    dataClone.OBJECT_REFERENCE_FORMAT = "{object:%s}";
    dataClone.SELF = "self";

    return dataClone;
}());
