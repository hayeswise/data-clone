<a name="dataClone"></a>

## dataClone ⇒ <code>Object</code>
Creates a deep clone of the object's data. By default, any properties begining with an underscore or are functionsare ignored. Only the object's own enumerable properties are considered - properities in the prototype chain are ignored. The ignored types and ignored properties can be changed by pushing new values into, or completely replacingthe values of, properites IGNORE_TYPES and IGONRE_PROPERTY_NAMES.

**Kind**: global variable  
**Returns**: <code>Object</code> - An object that is a deep "data" clone of the object's data.  
**See**: [https://github.com/hayeswise/data-clone](https://github.com/hayeswise/data-clone)  
**Author:** Brian Hayes ("Hayeswise")  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | The object to make a deep data clone of. |
| [depth] | <code>Number</code> | An optional current cloning depth value.  Typically not used. |
| [refs] | <code>Array</code> | An optional array of object references used to track circular references.  Typically not used. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| MAX_DEPTH | <code>Number</code> | Set this to a positive number greater than or equal to 1.  Default value is 5.  If the value is invalid, MAX_DEPTH is set to the default value. |
| IGNORE_TYPES | <code>Array.&lt;String&gt;</code> | Array of JavaScript types to ignore.  Default value is ["function"]. |
| IGONRE_PROPERTY_NAMES | <code>Array.&lt;String&gt;</code> | Array of regular expressions to specify which object property   names to ignore.  Default value is ["^_"] which is to ignore any properties beginning with an underscore. |

