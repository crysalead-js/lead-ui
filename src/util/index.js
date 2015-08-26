import {extend, merge} from "extend-merge";
import each from "for-each";
import camelize from "to-camel-case";
import isType from "is-native-type";
import clone from "copy-clone";
import path from "./path";
import string from "./string";

var _ = {
    extend: extend,
    merge: merge,
    clone: clone,
    each: each,
    camelize: camelize,
    noop: function(){ return function(){};}
};
extend(_, isType);
extend(_, path);
extend(_, string);

export default _;
