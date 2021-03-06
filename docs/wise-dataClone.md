﻿<a name="WISE"></a>

## WISE : <code>object</code>
WISE namespace for code develped by Brian S Hayes ("Hayeswise").

**Kind**: global namespace  
<a name="WISE.dataClone"></a>

### WISE.dataClone ⇒ <code>Object</code>
Creates a deep clone of the object's data.  The resultant object and any contained objects are based on an object
with no properties (a null object).  By default, any properties begining with an underscore or are functions are
ignored. Only the object's own enumerable properties are considered - properities in the prototype chain are ignored.
The ignored types and ignored propertiescan be changed by pushing new values into, or completely replacing the values
of, properites IGNORE_TYPES and IGNORE_PROPERTY_NAMES respectively.

**Kind**: static property of <code>[WISE](#WISE)</code>  
**Returns**: <code>Object</code> - An object that is a deep "data" clone of the object's data.  
**See**: [https://github.com/hayeswise/data-clone](https://github.com/hayeswise/data-clone)  
**Author:** Brian S Hayes ("Hayeswise")  
**License**: MIT  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | The object to make a deep data clone of. |
| [depth] | <code>Number</code> | An optional current cloning depth value.  Typically not used by the intial caller. The  function is recursive and calls its self with this parameter. |
| [refs] | <code>Map</code> | An optional map of object-to-object-paths used to track circular references. The map is keyed  with an object and the stored values is a dot notation string representing the path to the object (e.g.,  "self.firstName"). Typically not used by the intial caller. The function is recursive and calls its self with this  parameter. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| MAX_DEPTH | <code>Number</code> | Set this to a positive number greater than or equal to 1.  Default value is 5.  If the value is invalid, MAX_DEPTH is set to the default value. |
| IGNORE_TYPES | <code>Array.&lt;String&gt;</code> | Array of JavaScript types to ignore.  Default value is ["function"]. |
| IGNORE_PROPERTY_NAMES | <code>Array.&lt;String&gt;</code> | Array of regular expressions to specify which object property  names to ignore.  Default value is ["^_"] which is to ignore any properties beginning with an underscore. |
| OBJECT_REFERENCE_FORMAT | <code>String</code> | A sprintf style string used to create a textual representation of an object  reference.  E.g., "{object:self.address}".  The default value is "{object:%s}". |
| SELF | <code>String</code> | The text to use in an object reference to the root object.  Default is "self".  This value will  appear in object references when the MAX_DEPTH is reached.  e.g. "{object:self.father}" |

