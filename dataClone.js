// MIT License, Copyright (c) 2016 Brian Hayes ("Hayeswise")
// For more information, visit https://github.com/hayeswise/iitc-addremovemarker
/**
 * Creates a deep clone of the object's data. By default, any properties begining with an underscore or are functions
 * are ignored. Only the object's own enumerable properties are considered - properities in the prototype chain are 
 * ignored. The ignored types and ignored properties can be changed by pushing new values into, or completely replacing
 * the values of, properites IGNORE_TYPES and IGNORE_PROPERTY_NAMES.
 * @property MAX_DEPTH {Number} Set this to a positive number greater than or equal to 1.  Default value is 5.
 *  If the value is invalid, MAX_DEPTH is set to the default value.
 * @property IGNORE_TYPES {String[]} Array of JavaScript types to ignore.  Default value is ["function"].
 * @property IGNORE_PROPERTY_NAMES {String[]} Array of regular expressions to specify which object property 
 *  names to ignore.  Default value is ["^_"] which is to ignore any properties beginning with an underscore.
 * @param {Object} obj The object to make a deep data clone of.
 * @param {Number} [depth] An optional current cloning depth value.  Typically not used.
 * @param {Array} [refs] An optional array of object references used to track circular references.
 *  Typically not used.
 * @return {Object} An object that is a deep "data" clone of the object's data.
 * @author Brian Hayes ("Hayeswise")
 * @see {@link https://github.com/hayeswise/data-clone}
 */
var dataClone = (function () {
    function dataClone(obj, depth, refs) {
    	"use strict";
    	var copy = obj,
    	curObjMoniker,
    	firstTime,
    	keys;
        if (typeof dataClone.MAX_DEPTH !== "number" || dataClone.MAX_DEPTH < 1) {
            console.warn("Invalid value for dataClone.MAX_DEPTH (" + dataClone.MAX_DEPTH + "). Will use the default value.");
            dataClone.MAX_DEPTH = 5;
        }
    	firstTime = (refs === undefined);
    	if (firstTime) {
    		refs = new Map();
    		curObjMoniker = "self";
    		refs.set(obj, curObjMoniker);
    	} else {
    		curObjMoniker = refs.get(obj);
    	}
    	if (!depth || depth < 1) {
    		depth = 1;
    	}
    	if (depth > dataClone.MAX_DEPTH) {
    		if (obj !== undefined && typeof obj === "object") {
                switch (Object.prototype.toString.call(obj)) { // @todo do this in the forEach below.
                case "[object Date]":
                    return obj.toISOString();
                    break;
                case "[object RegExp]":
                    return obj.toString();
                    break;
                default:
                    return "{" + typeof obj + ":" + refs.get(obj) + "}"; // In the case of recursion, refs will minimally have the object that dataClone was called with.
                }
            } else {
                return obj;
    		}
    	}
    	if (obj && typeof obj === "object") { // handles Map, Set, Int*Array, Uint*Array etc. as well
            //@todo handle Date and RegExp here
            switch (Object.prototype.toString.call(obj)) { // @todo do this in the forEach below.
                case "[object Date]":
                    copy = obj.toISOString();
                    break;
                case "[object RegExp]":
                    copy = obj.toString();
                    break;
                default:
                    copy = Object.prototype.toString.call(obj) === "[object Array]" ? [] : Object.create(null);
                    keys = Object.keys(obj);
                    var subDepth = depth + 1;
                    keys.forEach(function (name) {
                        var ignoreThis;
                        ignoreThis = dataClone.IGNORE_TYPES.some(function (type) {
                            return (typeof copy[name] === type);
                        }) ||
                        dataClone.IGNORE_PROPERTY_NAMES.some(function(regexp) {
                            return (new RegExp(regexp).test(name));
                        });
                        if (!ignoreThis) {
                            if (!refs.has(obj[name])) {
                                refs.set(obj[name], refs.get(obj) + "." + name);
                            }
                            copy[name] = dataClone(obj[name], subDepth, refs);
                        }
                    });               
            }
    	}
    	return copy;
    }
    dataClone.MAX_DEPTH = 4;
    dataClone.IGNORE_TYPES = ["function"];
    dataClone.IGNORE_PROPERTY_NAMES = [/^_/]; //regexp
    
    return dataClone;
})();