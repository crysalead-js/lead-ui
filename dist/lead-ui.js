(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.leadUi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Component = require("./src/component");
var Components = require("./src/components");
var Renderer = require("./src/renderer");

module.exports = {
  Component: Component,
  Components: Components,
  Renderer: Renderer
};

},{"./src/component":38,"./src/components":39,"./src/renderer":42}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],4:[function(require,module,exports){
(function (Buffer){
var useBuffer = typeof Buffer !== "undefined";

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, { circular: false }).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param mixed  parent  The object to be cloned
 * @param Object options The clone options. Possible values are:
 *                       -`'circular'`  Boolean: set to true if the object to be cloned may
 *                                               contain circular references. (default: `true`)
 *                       -`'depth'`     Integer: clone depth limit. (default: `Infinity`)
 *                       -`'prototype'` String : sets the prototype to be used when cloning an object.
 *                                               (default: parent prototype).
 */
function clone(parent, opts) {
  var depth, prototype, filter, allParents = [], allChildren = [], options = {};

  opts = opts || {};
  options.depth = opts.depth !== undefined ? opts.depth : Infinity;
  options.circular = opts.circular !== undefined ? opts.circular : true;

  function _clone(parent, depth) {

    if (parent === null) {
      return null;
    }

    if (depth === 0 || typeof parent !== "object") {
      return parent;
    }

    var i, child, proto, attrs, index;

    if (Array.isArray(parent)) {
      child = [];
    } else if (toString.call(parent) === "[object RegExp]") {
      child = new RegExp(parent.source, _getRegExpFlags(parent));
      if (parent.lastIndex) {
        child.lastIndex = parent.lastIndex;
      }
    } else if (toString.call(parent) === "[object Date]") {
      return new Date(parent.getTime());
    } else if (useBuffer && Buffer.isBuffer(parent)) {
      child = new Buffer(parent.length);
      parent.copy(child);
      return child;
    } else if (!!(parent && parent.constructor && parent.constructor.BYTES_PER_ELEMENT > 0)) {
      return new parent.constructor(parent);
    } else {
      if (typeof options.prototype === "undefined") {
        proto = Object.getPrototypeOf(parent);
        child = Object.create(proto);
      } else {
        child = Object.create(prototype);
        proto = prototype;
      }
    }

    if (options.circular) {
      index = allParents.indexOf(parent);

      if (index !== -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    for (i in parent) {
      if (proto) {
        attrs = Object.getOwnPropertyDescriptor(proto, i);
      }

      if (attrs && attrs.set === null) {
        continue;
      }
      child[i] = _clone(parent[i], depth - 1);
    }

    return child;
  }

  return _clone(parent, options.depth);
}

function _getRegExpFlags(re) {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
};

module.exports = clone;

}).call(this,require("buffer").Buffer)
},{"buffer":2}],5:[function(require,module,exports){
var toCamelCase = require('to-camel-case');
var hasRemovePropertyInStyle = typeof document !== "undefined" && "removeProperty" in document.createElement("a").style;

/**
 * Gets/Sets a DOM element property.
 *
 * @param  Object        element A DOM element.
 * @param  String|Object name    The name of a property or an object of values to set.
 * @param  String        value   The value of the property to set, or none to get the current
 *                               property value.
 * @return String                The current/new property value.
 */
function css(element, name, value) {
  var name;
  if (arguments.length === 3) {
    name = toCamelCase((name === 'float') ? 'cssFloat' : name);
    if (value) {
      element.style[name] = value;
      return value;
    }
    if (hasRemovePropertyInStyle) {
      element.style.removeProperty(name);
    } else {
      element.style[name] = "";
    }
    return value;
  }
  if (typeof name === "string") {
    name = toCamelCase((name === 'float') ? 'cssFloat' : name);
    return element.style[name];
  }

  var style = name;
  for (name in style) {
    css(element, name, style[name]);
  }
  return style;
}

module.exports = css;

},{"to-camel-case":35}],6:[function(require,module,exports){
function query(selector, element) {
  return query.one(selector, element);
}

var one = function(selector, element) {
  return element.querySelector(selector);
}

var all = function(selector, element) {
  return element.querySelectorAll(selector);
}

query.one = function(selector, element) {
  if (!selector) {
    return;
  }
  if (typeof selector === "string") {
    element = element || document;
    return one(selector, element);
  }
  if (selector.length !== undefined) {
    return selector[0];
  }
  return selector;
}

query.all = function(selector, element){
  if (!selector) {
    return [];
  }
  var list;
  if (typeof selector !== "string") {
    if (selector.length === undefined) {
      return [selector];
    }
    list = selector;
  } else {
    element = element || document;
    list = all(selector, element);
  }
  return Array.prototype.slice.call(list);
};

query.engine = function(engine){
  if (!engine.one) {
    throw new Error('.one callback required');
  }
  if (!engine.all) {
    throw new Error('.all callback required');
  }
  one = engine.one;
  all = engine.all;
  return query;
};

module.exports = query;

},{}],7:[function(require,module,exports){
/**
 * This file automatically generated from `pre-publish.js`.
 * Do not manually edit.
 */

module.exports = {
  "area": true,
  "base": true,
  "br": true,
  "col": true,
  "embed": true,
  "hr": true,
  "img": true,
  "input": true,
  "keygen": true,
  "link": true,
  "menuitem": true,
  "meta": true,
  "param": true,
  "source": true,
  "track": true,
  "wbr": true
};

},{}],8:[function(require,module,exports){
/**
 * SVG namespaces.
 */
var namespaces = {
  xlink: 'http://www.w3.org/1999/xlink',
  xml: 'http://www.w3.org/XML/1998/namespace',
  xmlns: 'http://www.w3.org/2000/xmlns/'
};

/**
 * Maintains state of element namespaced attributes.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of attributes.
 * @param  Object attrs     The attributes to match on.
 * @return Object attrs     The element attributes state.
 */
function patch(element, previous, attrs) {
  if (!previous && !attrs) {
    return attrs;
  }
  var attrName, ns, name, value, split;
  previous = previous || {};
  attrs = attrs || {};

  for (attrName in previous) {
    if (previous[attrName] && !attrs[attrName]) {
      split = splitAttrName(attrName);
      ns = namespaces[split[0]];
      name = split[1];
      element.removeAttributeNS(ns, name);
    }
  }
  for (attrName in attrs) {
    value = attrs[attrName];
    if (previous[attrName] === value) {
      continue;
    }
    split = splitAttrName(attrName);
    ns = namespaces[split[0]];
    name = split[1];
    element.setAttributeNS(ns, name, value);
  }
  return attrs;
}

function splitAttrName(attrName) {
  return attrName.split(':');
}

module.exports = {
  patch: patch,
  namespaces: namespaces
};

},{}],9:[function(require,module,exports){
var style = require("./style");
var stringifyClass = require("../../util/stringify-class");

/**
 * Maintains state of element attributes.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of attributes.
 * @param  Object attrs     The attributes to match on.
 * @return Object attrs     The element attributes state.
 */
function patch(element, previous, attrs) {
  if (!previous && !attrs) {
    return attrs;
  }
  var name, value;
  previous = previous || {};
  attrs = attrs || {};

  for (name in previous) {
    if (!previous[name] || attrs[name] != null) {
      continue;
    }
    unset(name, element, previous);
  }
  for (name in attrs) {
    set(name, element, previous, attrs);
  }
  return attrs;
}

/**
 * Sets an attribute.
 *
 * @param  String name      The attribute name to set.
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of attributes.
 * @param  Object attrs     The attributes to match on.
 */
function set(name, element, previous, attrs) {
  if (set.handlers[name]) {
    set.handlers[name](name, element, previous, attrs);
  } else if (attrs[name] != null && previous[name] !== attrs[name]) {
    element.setAttribute(name, attrs[name]);
  }
};
set.handlers = Object.create(null);

/**
 * Unsets an attribute.
 *
 * @param  String name      The attribute name to unset.
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of attributes.
 */
function unset(name, element, previous) {
  if (unset.handlers[name]) {
    unset.handlers[name](name, element, previous);
  } else {
    element.removeAttribute(name);
  }
};
unset.handlers = Object.create(null);

/**
 * Custom set handler for the type attribute.
 * When changed the value is restored (IE compatibility).
 */
set.handlers.type = function(name, element, previous, attrs) {
  if (previous[name] === attrs[name]) {
    return;
  }
  var value = element.getAttribute('value');
  element.setAttribute(name, attrs[name]);
  element.setAttribute('value', value);
  element.value = value;
};

/**
 * Custom set handler for the value attribute.
 */
set.handlers.value = function(name, element, previous, attrs) {
  if (previous[name] === attrs[name]) {
    return;
  }
  element.setAttribute(name, attrs[name]);
  element[name] = attrs[name] ? attrs[name] : "";
};

/**
 * Custom set handler for the class attribute.
 */
set.handlers["class"] = function(name, element, previous, attrs) {
  if (attrs[name] == null) {
    return;
  }
  element.setAttribute(name, stringifyClass(attrs[name])); // Should work for IE > 7
};

/**
 * Custom set handler for the style attribute.
 */
set.handlers.style = function(name, element, previous, attrs) {
  style.patch(element, previous[name], attrs[name]);
};

/**
 * Custom unset handler for the style attribute.
 */
unset.handlers.style = function(name, element, previous) {
  style.patch(element, previous[name]);
};

module.exports = {
  patch: patch,
  set: set,
  unset: unset
};

},{"../../util/stringify-class":23,"./style":13}],10:[function(require,module,exports){
/**
 * Maintains state of element dataset.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of dataset.
 * @param  Object dataset   The dataset to match on.
 * @return Object dataset   The element dataset state.
 */
function patch(element, previous, dataset) {
  if (!previous && !dataset) {
    return dataset;
  }
  var name;
  previous = previous || {};
  dataset = dataset || {};

  for (name in previous) {
    if (dataset[name] === undefined) {
      delete element.dataset[name];
    }
  }

  for (name in dataset) {
    if (previous[name] === dataset[name]) {
      continue;
    }
    element.dataset[name] = dataset[name];
  }

  return dataset;
}

module.exports = {
  patch: patch
};

},{}],11:[function(require,module,exports){
var dataset = require("./dataset");
var stringifyClass = require("../../util/stringify-class");

/**
 * Maintains state of element properties.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of properties.
 * @param  Object props     The properties to match on.
 * @return Object props     The element properties state.
 */
function patch(element, previous, props) {
  if (!previous && !props) {
    return props;
  }
  var name, value;
  previous = previous || {};
  props = props || {};

  for (name in previous) {
    if (previous[name] === undefined || props[name] !== undefined) {
      continue;
    }
    unset(name, element, previous);
  }
  for (name in props) {
    set(name, element, previous, props);
  }
  return props;
}

/**
 * Sets a property.
 *
 * @param  String name      The property name to set.
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of properties.
 * @param  Object props     The properties to match on.
 */
function set(name, element, previous, props) {
  if (set.handlers[name]) {
    set.handlers[name](name, element, previous, props);
  } else if (previous[name] !== props[name]) {
    element[name] = props[name];
  }
};
set.handlers = Object.create(null);

/**
 * Unsets a property.
 *
 * @param  String name      The property name to unset.
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of properties.
 */
function unset(name, element, previous) {
  if (unset.handlers[name]) {
    unset.handlers[name](name, element, previous);
  } else {
    element[name] = null;
  }
};
unset.handlers = Object.create(null);

/**
 * Custom set handler for the type attribute.
 * When changed the value is restored (IE compatibility).
 */
set.handlers.type = function(name, element, previous, props) {
  if (previous[name] === props[name]) {
    return;
  }
  var value = element.value;
  element[name] = props[name];
  element.value = value;
};

/**
 * Custom set handler for the class attribute.
 */
set.handlers.className = function(name, element, previous, props) {
  element.className = props[name] ? stringifyClass(props[name]) : "";
};

/**
 * Custom set handler for the dataset attribute.
 */
set.handlers.dataset = function(name, element, previous, props) {
  dataset.patch(element, previous[name], props[name]);
};

/**
 * Custom unset handler for the class attribute.
 */
unset.handlers.className = function(name, element, previous) {
  element.className = "";
};

/**
 * Custom unset handler for the dataset attribute.
 */
unset.handlers.dataset = function(name, element, previous) {
  dataset.patch(element, previous[name], {});
};

module.exports = {
  patch: patch,
  set: set,
  unset: unset
};

},{"../../util/stringify-class":23,"./dataset":10}],12:[function(require,module,exports){
var isArray = Array.isArray;

/**
 * This is a convenience function which preprocesses the value attribute/property
 * set on a select or select multiple virtual node. The value is first populated over
 * corresponding `<option>` by setting the `"selected"` attribute and then deleted
 * from the node `attrs` & `props` field.
 */
function selectValue(node) {
  if (node.tagName !== "select") {
    return;
  }
  var value = node.attrs && node.attrs.value;
  value = value || node.props && node.props.value;

  if (value == null) {
    return;
  }

  var values = {};
  if (!isArray(value)) {
    values[value] = value;
  } else {
    for (var i = 0, len = value.length; i < len ; i++) {
      values[value[i]] = value[i];
    }
  }
  populateOptions(node, values);
  if (node.attrs && node.attrs.hasOwnProperty("value")) {
    delete node.attrs.value;
  }
  if (node.props && node.props.hasOwnProperty("value")) {
    delete node.props.value;
  }
}

function populateOptions(node, values) {
  if (node.tagName !== "option") {
    for (var i = 0, len = node.children.length; i < len ; i++) {
      populateOptions(node.children[i], values);
    }
    return;
  }
  var value = node.attrs && node.attrs.value;
  value = value || node.props && node.props.value;

  if (!values.hasOwnProperty(value)) {
    return;
  }
  node.attrs = node.attrs || {};
  node.attrs.selected = "selected";
  node.props = node.props || {};
  node.props.selected = true;
}

module.exports = selectValue;

},{}],13:[function(require,module,exports){
var domElementCss = require("dom-element-css");

/**
 * Maintains state of element style attribute.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of style attributes.
 * @param  Object style     The style attributes to match on.
 */
function patch(element, previous, style) {
  if (!previous && !style) {
    return style;
  }
  var rule;
  if (typeof style === "object") {
    if (typeof previous === "object") {
      for (rule in previous) {
        if (!style[rule]) {
          domElementCss(element, rule, null);
        }
      }
      domElementCss(element, style);
    } else {
      if (previous) {
        element.setAttribute("style", "");
      }
      domElementCss(element, style);
    }
  } else {
    element.setAttribute("style", style || "");
  }
}

module.exports = {
  patch: patch
};

},{"dom-element-css":5}],14:[function(require,module,exports){
var voidElements = require("void-elements");
var attach = require("../tree/attach");
var render = require("../tree/render");
var update = require("../tree/update");
var props = require("./patcher/props");
var attrs = require("./patcher/attrs");
var attrsNS = require("./patcher/attrs-n-s");
var selectValue = require("./patcher/select-value");
var stringifyAttrs = require("../util/stringify-attrs");

/**
 * The Virtual Tag constructor.
 *
 * @param  String tagName  The tag name.
 * @param  Object config   The virtual node definition.
 * @param  Array  children An array for children.
 */
function Tag(tagName, config, children) {
  this.tagName = tagName || "div";
  config = config || {};
  this.children = children || [];
  this.props = config.props;
  this.attrs = config.attrs;
  this.attrsNS = config.attrsNS;
  this.events = config.events;
  this.hooks = config.hooks;
  this.data = config.data;
  this.element = undefined;
  this.parent = undefined;

  this.key = config.key != null ? config.key : undefined;

  this.namespace = config.attrs && config.attrs.xmlns || null;
  this.is = config.attrs && config.attrs.is || null;
};

Tag.prototype.type = "Tag";

/**
 * Creates and return the corresponding DOM node.
 *
 * @return Object A DOM node.
 */
Tag.prototype.create = function() {
  var element;
  if (this.namespace) {
    if (this.is) {
      element = document.createElementNS(this.namespace, this.tagName, this.is);
    } else {
      element = document.createElementNS(this.namespace, this.tagName);
    }
  } else {
    if (this.is) {
      element = document.createElement(this.tagName, this.is);
    } else {
      element = document.createElement(this.tagName);
    }
  }
  return element;
};

/**
 * Renders the virtual node.
 *
 * @param  Object  container The container to render in.
 * @param  Object  parent    A parent node.
 * @return Object            The rendered DOM element.
 */
Tag.prototype.render = function(container, parent) {
  this.parent = parent;

  if (!this.namespace) {
    if (this.tagName === "svg" ) {
      this.namespace = "http://www.w3.org/2000/svg";
    } else if (this.tagName === "math") {
      this.namespace = "http://www.w3.org/1998/Math/MathML";
    } else if (parent) {
      this.namespace = parent.namespace;
    }
  }

  var element = this.element = this.create();

  if (this.events) {
    element.domLayerNode = this;
  }

  if (this.tagName === "select") {
    selectValue(this);
  }
  if (this.props) {
    props.patch(element, {}, this.props);
  }
  if (this.attrs) {
    attrs.patch(element, {}, this.attrs);
  }
  if (this.attrsNS) {
    attrsNS.patch(element, {}, this.attrsNS);
  }

  container = container ? container : document.createDocumentFragment();
  container.appendChild(element);

  render(element, this.children, this);

  if (this.hooks && this.hooks.created) {
    this.hooks.created(this, element);
  }
  return element;
};

/**
 * Attaches an existing DOM element.
 *
 * @param  Object element A textual DOM element.
 * @return Object         The textual DOM element.
 */
Tag.prototype.attach = function(element, parent) {
  this.parent = parent;
  this.element = element;
  if (this.events) {
    element.domLayerNode = this;
  }
  props.patch(element, {}, this.props);

  attach(element, this.children, this);

  if (this.hooks && this.hooks.created) {
    this.hooks.created(this, element);
  }
  return element;
}

/**
 * Check if the node match another node.
 *
 * Note: nodes which doesn't match must be rendered from scratch (i.e. can't be patched).
 *
 * @param  Object  to A node representation to check matching.
 * @return Boolean
 */
Tag.prototype.match = function(to) {
  return !(
    this.type !== to.type ||
    this.tagName !== to.tagName ||
    this.key !== to.key ||
    this.namespace !== to.namespace ||
    this.is !== to.is
  );
}

/**
 * Patches a node according to the a new representation.
 *
 * @param  Object to A new node representation.
 * @return Object    A DOM element, can be a new one or simply the old patched one.
 */
Tag.prototype.patch = function(to) {
  if (!this.match(to)) {
    this.remove(false);
    return to.render(this.element.parentNode, this.parent);
  }
  to.element = this.element;

  if (this.tagName === "select") {
    selectValue(to);
  }
  if (this.props || to.props) {
    props.patch(to.element, this.props, to.props);
  }
  if (this.attrs || to.attrs) {
    attrs.patch(to.element, this.attrs, to.attrs);
  }
  if (this.attrsNS || to.attrsNS) {
    attrsNS.patch(to.element, this.attrsNS, to.attrsNS);
  }

  update(to.element, this.children, to.children);

  if (to.events) {
    to.element.domLayerNode = to;
  } else if (this.events) {
    to.element.domLayerNode = undefined;
  }

  if (this.hooks && this.hooks.updated) {
    this.hooks.updated(this, to.element);
  }

  return to.element;
}

/**
 * Removes the DOM node attached to the virtual node.
 */
Tag.prototype.remove = function(destroy) {
  broadcastRemove(this);
  if(destroy !== false) {
    this.destroy();
  }
};

/**
 * Destroys the DOM node attached to the virtual node.
 */
Tag.prototype.destroy = function() {
  var element = this.element;

  if (!element) {
    return;
  }
  var parentNode = element.parentNode;
  if (!parentNode) {
    return;
  }
  if (!this.hooks || !this.hooks.destroy) {
    return parentNode.removeChild(element);
  }
  return this.hooks.destroy(element, function() {
    return parentNode.removeChild(element);
  });
};

/**
 * Broadcasts the remove "event".
 */
function broadcastRemove(node) {
  if (node.children) {
    for(var i = 0, len = node.children.length; i < len; i++) {
      broadcastRemove(node.children[i]);
    }
  }
  if (node.hooks && node.hooks.remove) {
    node.hooks.remove(node, node.element);
  }
}

/**
 * Returns an html representation of a tag node.
 */
Tag.prototype.toHtml = function() {

  var attrs = stringifyAttrs(this.attrs, this.tagName);
  var attrsNS = stringifyAttrs(this.attrsNS, this.tagName);
  var html = "<" + this.tagName + (attrs ? " " + attrs : "") + (attrsNS ? " " + attrsNS : "") + ">";

  var len = this.children.length;

  if (this.props && this.props.innerHTML && len === 0) {
    html += this.props.innerHTML;
  } else {
    for (var i = 0; i < len ; i++) {
      html += this.children[i].toHtml();
    }
  }
  html += voidElements[this.tagName] ? "" : "</" + this.tagName + ">";
  return html;

};

module.exports = Tag;

},{"../tree/attach":16,"../tree/render":19,"../tree/update":21,"../util/stringify-attrs":22,"./patcher/attrs":9,"./patcher/attrs-n-s":8,"./patcher/props":11,"./patcher/select-value":12,"void-elements":7}],15:[function(require,module,exports){
var escapeHtml = require("escape-html");

/**
 * The Virtual Text constructor.
 *
 * @param  String tagName  The tag name.
 * @param  Array  children An array for children.
 */
function Text(data) {
  this.data = data;
  this.element = undefined;
  this.parent = undefined;
}

Text.prototype.type = "Text";

/**
 * Creates and return the corresponding DOM node.
 *
 * @return Object A DOM node.
 */
Text.prototype.create = function() {
  return document.createTextNode(this.data);
}

/**
 * Renders virtual text node.
 *
 * @param  Object  container The container to render in.
 * @param  Object  parent    A parent node.
 * @return Object            A textual DOM element.
 */
Text.prototype.render = function(container, parent) {
  this.parent = parent;
  this.element = this.create();
  container = container ? container : document.createDocumentFragment();
  container.appendChild(this.element);
  return this.element
}

/**
 * Attaches an existing textual DOM element.
 *
 * @param  Object element A textual DOM element.
 * @return Object         The textual DOM element.
 */
Text.prototype.attach = function(element, parent) {
  this.parent = parent;
  return this.element = element;
}

/**
 * Check if the node match another node.
 *
 * Note: nodes which doesn't match must be rendered from scratch (i.e. can't be patched).
 *
 * @param  Object  to A node representation to check matching.
 * @return Boolean
 */
Text.prototype.match = function(to) {
  return this.type === to.type;
}

/**
 * Patches a node according to the a new representation.
 *
 * @param  Object to A new node representation.
 * @return Object    A DOM element, can be a new one or simply the old patched one.
 */
Text.prototype.patch = function(to) {
  if (!this.match(to)) {
    this.remove(false);
    return to.render(this.element.parentNode, this.parent);
  }
  to.element = this.element;
  if (this.data !== to.data) {
    this.element.data = to.data;
  }
  return this.element;
}

/**
 * Removes the DOM node attached to the virtual node.
 */
Text.prototype.remove = function(destroy) {
  if(destroy !== false) {
    this.destroy();
  }
};

/**
 * Destroys the DOM node attached to the virtual node.
 */
Text.prototype.destroy = function() {
  var parentNode = this.element.parentNode;
  return parentNode.removeChild(this.element);
};

/**
 * Returns an html representation of the text node.
 */
Text.prototype.toHtml = function() {
  return escapeHtml(this.data);
}

module.exports = Text;
},{"escape-html":26}],16:[function(require,module,exports){
var isArray = Array.isArray;

function attach(container, nodes, parent) {
  if (typeof nodes === "function") {
    nodes = nodes(container, parent);
  }
  if (!isArray(nodes)) {
    nodes = [nodes];
  }

  var i = 0, j = 0;
  var childNodes = container.childNodes;
  var nodesLen = nodes.length
  var text, textLen, size;

  while (i < nodesLen) {
    if (!nodes[i]) {
      i++;
      continue;
    }
    if (nodes[i].type !== "Text") {
      nodes[i].attach(childNodes[j], parent);
      i++;
    } else {
      // In an HTML template having consecutive textual nodes is not possible.
      // So the virtual tree will be dynamically adjusted to make attachments to
      // work out of the box in a transparent manner if this principle is not
      // respected in a virtual tree.

      size = nodes[i].data.length;
      text = childNodes[j].data;

      nodes[i].data = text;
      nodes[i].attach(childNodes[j], parent);
      i++;

      textLen = text.length;
      while (size < textLen && i < nodesLen) {
        size += nodes[i].data.length;
        nodes[i].data = "";
        i++;
      }
    }
    j++;
  }
  return nodes;
}

module.exports = attach;

},{}],17:[function(require,module,exports){
var isEmpty = require("is-empty");

var isArray = Array.isArray;

/**
 * Patches & Reorders child nodes of a container (i.e represented by `fromChildren`) to match `toChildren`.
 *
 * Since finding the longest common subsequence problem is NP-hard, this implementation
 * is a simple heuristic for reordering nodes with a "minimum" of moves in O(n).
 *
 * @param Object container    The parent container.
 * @param Array  children     The current array of children.
 * @param Array  toChildren   The new array of children to reach.
 * @param Object parent       The parent virtual node.
 */
function patch(container, children, toChildren, parent) {
  var fromChildren = children.slice();
  var fromStartIndex = 0, toStartIndex = 0;
  var fromEndIndex = fromChildren.length - 1;
  var fromStartNode = fromChildren[0];
  var fromEndNode = fromChildren[fromEndIndex];
  var toEndIndex = toChildren.length - 1;
  var toStartNode = toChildren[0];
  var toEndNode = toChildren[toEndIndex];

  var indexes, index, node, before;

  while (fromStartIndex <= fromEndIndex && toStartIndex <= toEndIndex) {
    if (fromStartNode === undefined) {
      fromStartNode = fromChildren[++fromStartIndex];
    } else if (fromEndNode === undefined) {
      fromEndNode = fromChildren[--fromEndIndex];
    } else if (fromStartNode.match(toStartNode)) {
      fromStartNode.patch(toStartNode);
      fromStartNode = fromChildren[++fromStartIndex];
      toStartNode = toChildren[++toStartIndex];
    } else if (fromEndNode.match(toEndNode)) {
      fromEndNode.patch(toEndNode);
      fromEndNode = fromChildren[--fromEndIndex];
      toEndNode = toChildren[--toEndIndex];
    } else if (fromStartNode.match(toEndNode)) {
      fromStartNode.patch(toEndNode);
      container.insertBefore(fromStartNode.element, fromEndNode.element.nextSibling);
      fromStartNode = fromChildren[++fromStartIndex];
      toEndNode = toChildren[--toEndIndex];
    } else if (fromEndNode.match(toStartNode)) {
      fromEndNode.patch(toStartNode);
      container.insertBefore(fromEndNode.element, fromStartNode.element);
      fromEndNode = fromChildren[--fromEndIndex];
      toStartNode = toChildren[++toStartIndex];
    } else {
      if (indexes === undefined) {
        indexes = keysIndexes(fromChildren, fromStartIndex, fromEndIndex);
      }
      index = indexes[toStartNode.key];
      if (index === undefined) {
        container.insertBefore(toStartNode.render(parent), fromStartNode.element);
        toStartNode = toChildren[++toStartIndex];
      } else {
        node = fromChildren[index];
        node.patch(toStartNode);
        fromChildren[index] = undefined;
        container.insertBefore(node.element, fromStartNode.element);
        toStartNode = toChildren[++toStartIndex];
      }
    }
  }
  if (fromStartIndex > fromEndIndex) {
    before = toChildren[toEndIndex + 1] === undefined ? null : toChildren[toEndIndex + 1].element;
    for (; toStartIndex <= toEndIndex; toStartIndex++) {
      container.insertBefore(toChildren[toStartIndex].render(parent), before);
    }
  } else if (toStartIndex > toEndIndex) {
    for (; fromStartIndex <= fromEndIndex; fromStartIndex++) {
      if (fromChildren[fromStartIndex] !== undefined) {
        fromChildren[fromStartIndex].remove();
      }
    }
  }
  return toChildren;
}

/**
 * Returns indexes of keyed nodes.
 *
 * @param  Array  children An array of nodes.
 * @return Object          An object of keyed nodes indexes.
 */
function keysIndexes(children, startIndex, endIndex) {
  var i, keys = Object.create(null), key;
  for (i = startIndex; i <= endIndex; ++i) {
    key = children[i].key;
    if (key !== undefined) {
      keys[key] = i;
    }
  }
  return keys;
}

module.exports = patch;

},{"is-empty":33}],18:[function(require,module,exports){

function remove(nodes, parent) {
  for (var i = 0, len = nodes.length; i < len; i++) {
    nodes[i].remove();
  }
}

module.exports = remove;

},{}],19:[function(require,module,exports){
var isArray = Array.isArray;

function render(container, nodes, parent) {
  if (typeof nodes === "function") {
    nodes = nodes(container, parent);
  }
  if (!isArray(nodes)) {
    nodes = [nodes];
  }
  for (var i = 0, len = nodes.length; i < len; i++) {
    if (nodes[i]) {
      nodes[i].render(container, parent);
    }
  }
  return nodes;
}

module.exports = render;

},{}],20:[function(require,module,exports){
var query = require("dom-query");
var attach = require("./attach");
var render = require("./render");
var update = require("./update");
var remove = require("./remove");
var isArray = Array.isArray;

function Tree() {
  this._mounted = Object.create(null);
}

/**
 * Mounts a virtual tree into a passed selector.
 *
 * @param String|Object   selector A CSS string selector or a DOMElement identifying the mounting point.
 * @param Function|Object factory  A factory function which returns a virtual tree or the virtual tree itself.
 * @param Object          data     Some extra data to attach to the mount.
 */
Tree.prototype.mount = function(selector, factory, data) {
  data = data || {};
  var containers = query.all(selector);
  if (containers.length !== 1) {
    throw new Error("The selector must identify an unique DOM element");
  }

  var container = containers[0];
  if (container.domLayerTreeId) {
    this.unmount(container.domLayerTreeId);
  }

  var mountId = data.mountId ? data.mountId : this.uuid();
  var fragment = document.createDocumentFragment();
  data.container = container;
  data.factory = factory;
  data.children = render(fragment, factory, null);
  container.appendChild(fragment);
  this._mounted[mountId] = data;
  return container.domLayerTreeId = mountId;
};

/**
 * Attaches a virtual tree onto a previously rendered DOM tree.
 *
 * @param String|Object   selector A CSS string selector or a DOMElement identifying the mounting point
 *                                 containing a previously rendered DOM tree.
 * @param Function|Object factory  A factory function which returns a virtual tree or the virtual tree itself.
 * @param Object          data     Some extra data to attach to the mount.
 */
Tree.prototype.attach = function(selector, factory, data) {
  data = data || {};
  var containers = query.all(selector);
  if (containers.length !== 1) {
    throw new Error("The selector must identify an unique DOM element");
  }

  var container = containers[0];
  if (container.domLayerTreeId) {
    this.unmount(container.domLayerTreeId);
  }

  var mountId = data.mountId ? data.mountId : this.uuid();
  data.container = container;
  data.factory = factory;
  data.children = attach(container, factory, null);
  this._mounted[mountId] = data;
  return container.domLayerTreeId = mountId;
};

/**
 * Returns a UUID identifier.
 *
 * @return String a unique identifier
 */
Tree.prototype.uuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
};

/**
 * Unmounts a virtual tree.
 *
 * @param String mountId An optionnal mount identifier or none to update all mounted virtual trees.
 */
Tree.prototype.unmount = function(mountId) {
  if (arguments.length) {
    var mount = this._mounted[mountId];
    if (mount) {
      remove(mount.children);
      delete mount.container.domLayerTreeId;
      delete this._mounted[mountId];
    }
    return;
  }
  for (mountId in this._mounted) {
    this.unmount(mountId);
  }
};

/**
 * Updates a mount (ie. run the factory function and updates the DOM according to occured changes).
 *
 * @param String mountId An optionnal mount identifier or none to update all mounted virtual trees.
 * @param String tree    An optionnal virtual tree to use.
 */
Tree.prototype.update = function(mountId, tree) {
  if (arguments.length) {
    var mount = this._mounted[mountId];
    if (mount) {
      var active = document.activeElement;
      mount.children = update(mount.container, mount.children, tree ? tree : mount.factory, null);
      if (document.activeElement !== active) {
        active.focus();
      }
    }
    return;
  }
  for (mountId in this._mounted) {
    this.update(mountId);
  }
};

/**
 * Returns the definition of a mounted tree all of them if no `mountId` is provided.
 *
 * @param  String mountId A mount identifier or none to get all mounts.
 * @return Object         A mount definition or all of them indexed by their id.
 */
Tree.prototype.mounted = function(mountId) {
  if (arguments.length) {
    return this._mounted[mountId];
  }
  return this._mounted;
};

module.exports = Tree;

},{"./attach":16,"./remove":18,"./render":19,"./update":21,"dom-query":6}],21:[function(require,module,exports){
var patch = require("./patch");

var isArray = Array.isArray;

function update(container, fromNodes, toNodes, parent) {
  if (typeof toNodes === "function") {
    toNodes = toNodes(container, parent);
  }
  if (!isArray(toNodes)) {
    toNodes = [toNodes];
  }
  return patch(container, fromNodes, toNodes, parent);
}

module.exports = update;

},{"./patch":17}],22:[function(require,module,exports){
var stringifyStyle = require("./stringify-style");
var stringifyClass = require("./stringify-class");

/**
 * Returns a `'key1="value1" key2="value2" ...'` string from
 * a `{ key1: "value1", key2: "value2" }` object.
 *
 * @param  Object attrs The keys/values object to stringify.
 * @return String       The corresponding string.
 */
function stringifyAttrs(attrs, tagName) {
  if (!attrs) {
    return "";
  }
  var attributes = [], value;
  for (var key in attrs) {
    value = attrs[key];
    if (key === "style") {
      value = stringifyStyle(value);
    } else if (key === "class") {
      value = stringifyClass(value);
    }
    if (key === "value" && (/^(?:textarea|select)$/i.test(tagName) || attrs.contenteditable)) {
      continue;
    }
    attributes.push(key + '="' + String(value).replace(/"/g, '\\"') + '"');
  }
  return attributes.join(" ");
}

module.exports = stringifyAttrs;

},{"./stringify-class":23,"./stringify-style":24}],23:[function(require,module,exports){
/**
 * Returns a `'class1 class3" ...'` string from
 * a `{ class1: true, class2: false, class3: true }` object.
 *
 * @param  Object className The keys/values object to stringify.
 * @return String           The corresponding string.
 */
function stringifyClass(classAttr) {
  if (typeof classAttr === "string") {
    return classAttr;
  }
  var classes = [];
  for (var key in classAttr) {
    if (classAttr[key]) {
      classes.push(key);
    }
  }
  return classes.join(" ");
}

module.exports = stringifyClass;

},{}],24:[function(require,module,exports){
/**
 * Returns a `'key1:value1;key2:value2" ...'` string from
 * a `{ key1: "value1", key2: "value2" }` object.
 *
 * @param  Object attrs The keys/values object to stringify.
 * @return String       The corresponding string.
 */
function stringifyStyle(style) {
  if (typeof style === "string") {
    return style;
  }
  var values = [];
  for (var key in style) {
    values.push(key + ':' + style[key]);
  }
  return values.join(";");
}

module.exports = stringifyStyle;

},{}],25:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],26:[function(require,module,exports){
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} str The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

},{}],27:[function(require,module,exports){
/**
 * Extends/merges the object in the first argument.
 *
 * Note: -- values ARE NOT cloned --
 *
 * @param  Object* ...  A list of objects with target first (target, obj1, [obj2], ..., [objN]).
 * @param  Boolean deep Indicates a shallow extend if `false` or a deep merge if `true`.
 * @return Object       The extended/merged object.
 */
function baseExtend(args, deep) {

  var i, j, obj, src, key, keys, len;
  var target = args[0];
  var length = args.length;

  for (i = 1; i < length; ++i) {

    obj = args[i];
    if ((obj === null || typeof obj !== 'object') && typeof obj !== 'function'){
      continue;
    }

    keys = Object.keys(obj);
    len = keys.length;

    for (j = 0; j < len; j++) {
      key = keys[j];
      src = obj[key];
      if (deep && src !== null && typeof src === 'object') {
        if (target[key] === null || typeof target[key] !== 'object') {
          target[key] = Array.isArray(src) ? [] : {};
        }
        baseExtend([target[key], src], true);
      } else {
        target[key] = src;
      }
    }
  }
  return target;
}

module.exports = baseExtend;

},{}],28:[function(require,module,exports){
var baseExtend = require("./base-extend");

/**
 * Extends the object in the first argument.
 *
 * Note: -- values ARE NOT cloned --
 *
 * @param  Object* ... A list of objects with target first (target, obj1, [obj2], ..., [objN]).
 * @return Object      The extended object.
 */
module.exports = function() {
  return baseExtend(arguments, false);
}

},{"./base-extend":27}],29:[function(require,module,exports){
var extend = require("./extend");
var merge = require("./merge");

module.exports = {
  extend: extend,
  merge: merge
};

},{"./extend":28,"./merge":30}],30:[function(require,module,exports){
var baseExtend = require("./base-extend");

/**
 * Merges the object in the first argument in a deep way.
 *
 * Note: -- values ARE NOT cloned --
 *
 * @param  Object* ... A list of objects with target first (target, obj1, [obj2], ..., [objN]).
 * @return Object      The merged object.
 */
module.exports = function() {
  return baseExtend(arguments, true);
}

},{"./base-extend":27}],31:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":32}],32:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],33:[function(require,module,exports){

/**
 * Expose `isEmpty`.
 */

module.exports = isEmpty;


/**
 * Has.
 */

var has = Object.prototype.hasOwnProperty;


/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty (val) {
  if (null == val) return true;
  if ('number' == typeof val) return 0 === val;
  if (undefined !== val.length) return 0 === val.length;
  for (var key in val) if (has.call(val, key)) return false;
  return true;
}
},{}],34:[function(require,module,exports){
/**
 * Type checking of Javascript native types.
 */

/**
 * Object type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isObject(value) {
   return value !== null && typeof value === 'object';
}

/**
 * Strict object type check. Only returns `true`
 * for plain JavaScript objects.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isPlainObject(value) {
  return isObject(value) && value.constructor === Object;
}

/**
 * Array type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isArray(value) {
  return Array.isArray(value);
};

/**
 * Number type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isNumber(value) {
  return typeof value == "number";
};

/**
 * String type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isString(value) {
  return typeof value === "string";
};

/**
 * Boolean type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isBoolean(value) {
  return typeof value === 'boolean';
};


/**
 * Array type check.
 *
 * @param  mixed   data The value to check.
 * @return Boolean
 */
function isTypedArray(value) {
  return !!(value && value.constructor && value.constructor.BYTES_PER_ELEMENT > 0);
}

/**
 * Function type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isFunction(value) {
  return typeof value == "function";
};

/**
 * Date type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isDate(value) {
  return toString.call(value) === "[object Date]";
};


/**
 * Number type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isRegExp(value) {
  return toString.call(value) === "[object RegExp]";
};

/**
 * Scalar type check.
 *
 * @param  mixed   data The value to check.
 * @return Boolean
 */
function isScalar(value) {
  return value === null ||
         typeof value === "boolean"  ||
         typeof value === "number"   ||
         typeof value === "string"   ||
         typeof value === "undefined";
}

module.exports = {
  isObject: isObject,
  isPlainObject: isPlainObject,
  isArray: isArray,
  isTypedArray: isTypedArray,
  isNumber: isNumber,
  isString: isString,
  isBoolean: isBoolean,
  isDate: isDate,
  isRegExp: isRegExp,
  isFunction: isFunction,
  isScalar: isScalar
};

},{}],35:[function(require,module,exports){

var toSpace = require('to-space-case');


/**
 * Expose `toCamelCase`.
 */

module.exports = toCamelCase;


/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */


function toCamelCase (string) {
  return toSpace(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase();
  });
}
},{"to-space-case":36}],36:[function(require,module,exports){

var clean = require('to-no-case');


/**
 * Expose `toSpaceCase`.
 */

module.exports = toSpaceCase;


/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */


function toSpaceCase (string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : '';
  });
}
},{"to-no-case":37}],37:[function(require,module,exports){

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasCamel = /[a-z][A-Z]/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();

  if (hasSeparator.test(string)) string = unseparate(string);
  if (hasCamel.test(string)) string = uncamelize(string);
  return string.toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
},{}],38:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _componentEmitter = require("component-emitter");

var _componentEmitter2 = _interopRequireDefault(_componentEmitter);

var _util = require("./util");

var _util2 = _interopRequireDefault(_util);

var Component = (function () {

  /**
   * The view constructor.
   *
   * @param String   template An evaluable hyperscript template. (default: `"[];"`).
   * @param Function renderer The DSL function to use for creating virtual DOM. (default: `h`)
   */

  function Component(options) {
    _classCallCheck(this, Component);

    var template;

    options = options || {};
    this._scope = options.scope || {};
    this._parent = options.parent;
    this._children = {};
    this._dirty = false;
    this.content(options.content || []);
    this.renderer(options.renderer);
    this.template(options.template || '$.h("div")');

    this._data = options.data || {};
    this._ref = this._data.ref || "anonymous-component" + Component.counter++;

    if (this._parent) {
      this._parent.register(this._ref, this);
      this._parent.invalidate();
    }
    this.vm(this._scope, this._data, this);
  }

  /**
   * Returns the transcluded childrens
   *
   * @return Array The transcluded childrens.
   */

  _createClass(Component, [{
    key: "content",
    value: function content(_content) {
      if (_content) {
        this._content = _content;
      }
      return this._content;
    }

    /**
     * Returns the view renderer string template. If a string template exists,
     * it will be compiled and used instead of the `_template` variable.
     *
     * @return String An evaluable renderer template.
     */
  }, {
    key: "template",
    value: function template(_template) {
      if (_template) {
        this._template = _template;
      }
      return this._template;
    }

    /**
     * Returns the virtual DOM builder function of this view instance.
     *
     * @return Function The virtual DOM builder.
     */
  }, {
    key: "renderer",
    value: function renderer(_renderer) {
      if (_renderer) {
        this._renderer = _renderer;
      }
      return this._renderer;
    }

    /**
     * Returns the virtual DOM generated during the last `build()` call.
     *
     * @return Object The last built virtual DOM.
     */
  }, {
    key: "virtual",
    value: function virtual() {
      return this._virtual;
    }

    /**
     * Returns the component's children.
     *
     * @return Object The component's children.
     */
  }, {
    key: "children",
    value: function children() {
      return this._children;
    }

    /**
     * Returns the parent component.
     *
     * @return Object The parent component instance.
     */
  }, {
    key: "parent",
    value: function parent() {
      return this._parent;
    }

    /**
     * Gets/Sets the dirty flag.
     *
     * @param  Boolean value A `true`/`false` value or none to get the value.
     * @return Boolean       The dirty value.
     */
  }, {
    key: "dirty",
    value: function dirty(value) {
      if (arguments.length) {
        this._dirty = !!value;
        if (this._dirty) {
          _util2["default"].each(this.children(), (function (child) {
            child.dirty(true);
          }).bind(this));
          this.emit("refresh");
        }
      }
      return this._dirty;
    }
  }, {
    key: "invalidate",
    value: function invalidate() {
      if (this._parent && this._parent.get() === this._scope) {
        return this._parent.invalidate();
      }
      this.dirty(true);
    }

    /**
     * Registers a child component.
     *
     * @param  String ref   The name reference of the child.
     * @param  Object child The child component instance.
     */
  }, {
    key: "register",
    value: function register(ref, child) {
      this._children[ref] = child;
    }

    /**
     * Unregisters a child component.
     *
     * @param  String ref The name reference of the child.
     */
  }, {
    key: "unregister",
    value: function unregister(ref) {
      delete this._children[ref];
    }

    /**
     * Renders a html string.
     *
     * @param  Object data The data to use for the rendering.
     * @return String      An html template.
     */
  }, {
    key: "toHtml",
    value: function toHtml() {
      var node = this.render();
      return node ? node.toHtml() : '';
    }

    /**
     * Sets something inside the vm scope using a dotted path notation (square brackets are
     * allowed to identify an array).
     *
     * @param  String path  The path.
     * @param  mixed  value The value.
     * @return mixed        The setted value.
     */
  }, {
    key: "set",
    value: function set(path, value) {
      var value = _util2["default"].set(this._scope, path, value);
      this.invalidate();
      return value;
    }

    /**
     * Gets something inside the vm scope using a dotted path notation (square brackets are
     * allowed to identify an array).
     *
     * @param  String path  The path.
     * @return mixed        The contained value.
     */
  }, {
    key: "get",
    value: function get(path) {
      return _util2["default"].get(this._scope, path);
    }

    /**
     * Returns a virtual DOM.
     *
     * @param  Object scope The data to use for the rendering.
     * @return mixed        The generated virtual DOM.
     */
  }, {
    key: "render",
    value: function render() {
      var node = this.template()(this.renderer(), this.get(), this);
      node = _util2["default"].isArray(node) ? node[0] : node;
      if (!node) {
        return;
      }
      node.hooks = {
        created: (function (node, element) {
          this.on('refresh', (function () {
            this.renderer().refresh(this);
          }).bind(this));
          this.emit('mounted', element);
        }).bind(this),
        dirty: (function (node) {
          return this.dirty();
        }).bind(this),
        remove: (function (node, element) {
          this.emit('unmounted', element);
        }).bind(this)
      };
      return node;
    }

    /* //////////////////////////////////////////
     *
     *  Available hooks which are
     *  triggered during the component lifecyle.
     *
     * //////////////////////////////////////////
     */

  }, {
    key: "vm",
    value: function vm(scope, data, component) {}

    /*
     * mount(scope) {
     * }
     *
     * mounted(scope, element) {
     * }
     *
     * updated(scope, element) {
     * }
     *
     * unmounted(scope, element) {
     * }
     */
  }]);

  return Component;
})();

(0, _componentEmitter2["default"])(Component.prototype);

Component.counter = 1;

Component.prototype._emit = Component.prototype.emit;

/**
 * Emits an event.
 *
 * @param  String  event The event name to emit.
 * @return Boolean       Returns true if event had listeners, false otherwise.
 */
Component.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var methodArgs = args.slice();
  methodArgs.unshift(this._scope);
  methodArgs.unshift(event);
  if (_util2["default"].isFunction(this[event])) {
    this[event].apply(this, methodArgs.slice(1));
  }
  return this._emit.apply(this, methodArgs);
};

exports["default"] = Component;
module.exports = exports["default"];

},{"./util":43,"component-emitter":3}],39:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Components = (function () {

  /**
   * Tags constructor.
   *
   * @param Object options The options object. Possible options are:
   *                       -`'render'` _Function_: The logic for creating a DOM node from a VNode.
   */

  function Components(options) {
    _classCallCheck(this, Components);

    options = options || {};
    this._components = {};
  }

  /**
   * Registers a tag name.
   *
   * @param String   name      The tag name to register.
   * @param Function className The view class to use for this tag name.
   */

  _createClass(Components, [{
    key: "register",
    value: function register(name, className) {
      this._components[name.toLowerCase()] = className;
    }

    /**
     * Unregisters a tag name.
     *
     * @param String name The tag name to unregister.
     */
  }, {
    key: "unregister",
    value: function unregister(name) {
      delete this._components[name.toLowerCase()];
    }

    /**
     * Checks tag name existance.
     *
     * @param  String  name The tag name to unregister.
     * @return Boolean      Returns `true` is the tag exists `false` otherwise.
     */
  }, {
    key: "exists",
    value: function exists(name) {
      return name && !!this._components[name.toLowerCase()];
    }

    /**
     * Creates a tag instance.
     *
     * @param  String name The tag name to instanciate.
     * @return Object      A tag instance.
     */
  }, {
    key: "create",
    value: function create(name, options) {
      options = options || {};
      if (!this.exists(name)) {
        throw new Error("Error, unexisting Tag `" + name + "`.");
      }
      name = name.toLowerCase();
      return new this._components[name](options);
    }
  }]);

  return Components;
})();

exports["default"] = Components;
module.exports = exports["default"];

},{}],40:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _util = require("../util");

var _util2 = _interopRequireDefault(_util);

function _each(expression, properties) {
  var match = expression.match(/^\s*\((\w+),?\s*(\w+)?\)\s+in\s+(.+?)\s*$/);

  if (!match) {
    throw new Error("Expected `'each'` expression to be a string of the following format '(item, value) in collection'.");
  }

  var params = [];
  var hasKey = match[2] !== undefined;
  var scope = properties.data.scope;

  if (!scope || !scope[match[3]]) {
    return [];
  }

  var list = scope[match[3]];

  _util2["default"].each(list, function (value, key) {
    var clone = {
      props: properties.props,
      attrs: _util2["default"].extend({}, properties.attrs),
      events: properties.events,
      callbacks: properties.callbacks,
      namespace: properties.namespace,
      data: _util2["default"].extend({}, properties.data)
    };
    var s = {};
    s.__proto__ = scope;
    s[match[1]] = value;
    if (hasKey) {
      s[match[2]] = key;
    }
    clone.data.scope = s;
    clone.data.component = properties.data.component;
    params.push(clone);
  });
  return params;
}

exports["default"] = _each;
module.exports = exports["default"];

},{"../util":43}],41:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _util = require("../util");

var _util2 = _interopRequireDefault(_util);

function _if(expression, properties) {
  if (_util2["default"].isFunction(expression)) {
    expression = expression(properties.data ? properties.data.scope : {});
  }
  return expression === "true" ? [properties] : [];
}

exports["default"] = _if;
module.exports = exports["default"];

},{"../util":43}],42:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _domQuery = require("dom-query");

var _domQuery2 = _interopRequireDefault(_domQuery);

var _domLayerSrcTreeTree = require("dom-layer/src/tree/tree");

var _domLayerSrcTreeTree2 = _interopRequireDefault(_domLayerSrcTreeTree);

var _domLayerSrcNodeTag = require('dom-layer/src/node/tag');

var _domLayerSrcNodeTag2 = _interopRequireDefault(_domLayerSrcNodeTag);

var _domLayerSrcNodeText = require('dom-layer/src/node/text');

var _domLayerSrcNodeText2 = _interopRequireDefault(_domLayerSrcNodeText);

var _components2 = require("./components");

var _components3 = _interopRequireDefault(_components2);

var _util = require("./util");

var _util2 = _interopRequireDefault(_util);

var _modifiersIf = require("./modifiers/if");

var _modifiersIf2 = _interopRequireDefault(_modifiersIf);

var _modifiersEach = require("./modifiers/each");

var _modifiersEach2 = _interopRequireDefault(_modifiersEach);

var Renderer = (function () {
  /**
   * Renderer constructor.
   */

  function Renderer(options) {
    _classCallCheck(this, Renderer);

    options = options || {};
    this._modifiers = {};
    this._ordered = [];
    this._tree = options.tree || new _domLayerSrcTreeTree2["default"]();
    this._components = options.components || new _components3["default"]();
    this.register('if', _modifiersIf2["default"]);
    this.register('each', _modifiersEach2["default"]);
  }

  /**
   * Gets/sets the tree instance.
   *
   * @return object The tree instance.
   */

  _createClass(Renderer, [{
    key: "tree",
    value: function tree(_tree) {
      if (_tree) {
        this._tree = _tree;
      }
      return this._tree;
    }

    /**
     * Gets/sets the components instance.
     *
     * @return Object The components instance.
     */
  }, {
    key: "components",
    value: function components(_components) {
      if (_components) {
        this._components = _components;
      }
      return this._components;
    }

    /**
     * Registers a modifier.
     *
     * @param String   name      The modifier name to register.
     * @param Function className The class to use for this modifier name.
     */
  }, {
    key: "register",
    value: function register(name, className) {
      this._ordered.push(name);
      this._modifiers[name] = className;
    }

    /**
     * Unregisters a modifier.
     *
     * @param String name The modifier name to unregister.
     */
  }, {
    key: "unregister",
    value: function unregister(name) {
      var index = this._ordered.indexOf(name);
      if (index > -1) {
        this._ordered.splice(index, 1);
        this._ordered = this._ordered.map((function (v) {
          return this._ordered[v];
        }).bind(this));
      }
      delete this._modifiers[name];
    }

    /**
     * Lists registered modifiers.
     *
     * @return Array The array of registered widget names.
     */
  }, {
    key: "registered",
    value: function registered() {
      return this._ordered;
    }

    /**
     * Checks if a modifier exists.
     *
     * @param  String  name The modifier name to check.
     * @return Boolean      Returns `true` is the modifier exists `false` otherwise.
     */
  }, {
    key: "exists",
    value: function exists(name) {
      return !!this._modifiers[name];
    }

    /**
     * Gets the priority of a modifier.
     *
     * @param  String  name The modifier name to unregister.
     * @return Integer      Returns the modifier priority.
     */
  }, {
    key: "priority",
    value: function priority(name) {
      return this._ordered.indexOf(name);
    }

    /**
     * Builds a virtual dom tree using the virtual dom DSL.
     *
     * @param  Object vdef       The virtual node definition. Possible values are:
     *                           -`'config'`  _Object_   : An object that describe the virtual node
     *                                                       (e.g. `{ tagName: "span", props: { className: "bar" } }`).
     *                           -`'children'` _Function_ : A function which returns an array of children
     *                           -`'<data>'`   _mixed_    : Some custom data to attach to the virtual node.
     * @param  Function children A function which return an array of any combination of virtual nodes.
     * @return Array             A flattened array of virtual nodes.
     */
  }, {
    key: "h",
    value: function h(tagName, config, children, scope, component) {
      var modifiers = [];

      if (!tagName) {
        return _util2["default"].isFunction(config) ? new _domLayerSrcNodeText2["default"](config(children)) : new _domLayerSrcNodeText2["default"](config);
      }

      config.data = config.data || {};
      config.data.scope = scope;
      config.data.component = component;

      _util2["default"].each(config.attrs, (function (value, name, attrs) {
        if (name === "component") {
          tagName = value(scope);
          delete attrs[name];
        } else if (this.exists(name)) {
          modifiers.push({ name: name, value: value, p: this.priority(name) });
          delete attrs[name];
        }
      }).bind(this));

      modifiers = modifiers.sort(function (a, b) {
        return a.p - b.p;
      });

      var nodes = this._transform(modifiers, tagName, config, children);

      return _util2["default"].isArray(nodes) ? nodes : [nodes];
    }

    /**
     * Transforms an hyperscript node into a nested array of virtual dom definition using
     * the virtual dom DSL (i.e. using `Tag`)
     *
     * @param  Object vdef See the `h()` function for details.
     * @return Array       A flattened array of virtual nodes.
     */
  }, {
    key: "_transform",
    value: function _transform(modifiers, tagName, config, children) {
      if (modifiers.length) {
        var statement = modifiers.shift();
        var modifier = this._modifiers[statement.name];
        var params = modifier(statement.value, config);

        return params.map((function (param) {
          return this._transform(modifiers, tagName, param, children);
        }).bind(this));
      }

      var scope = config.data.scope;
      var component = config.data.component;

      if (tagName === 'content') {
        var content = component.content();
        var parent = component.parent();
        var contentScope;

        if (parent) {
          contentScope = _util2["default"].extend({}, scope);
          contentScope.__proto__ = component.parent().get();
        } else {
          contentScope = scope;
        }

        return content ? content(contentScope, component) : [];
      }

      _util2["default"].each(config.attrs, function (value, name, attrs) {
        if (_util2["default"].isFunction(value)) {
          attrs[name] = value(scope);
        }
      });

      _util2["default"].each(config.data, function (value, name, data) {
        if (_util2["default"].isFunction(value)) {
          data[name] = value(scope);
        }
      });

      if (this._components.exists(tagName)) {
        return this._createComponent(tagName, config, children);
      }
      return new _domLayerSrcNodeTag2["default"](tagName, config, children ? children(scope, component) : []);
    }

    /**
     * Returns a the virtual tag node.
     *
     * @param  Object config See the `h()` function for details.
     * @return Object        A virtual tag node.
     */
  }, {
    key: "_createComponent",
    value: function _createComponent(tagName, config, children) {
      config.hooks = {
        created: (function (node, element) {
          var isolated = node.attrs && node.attrs.isolated;
          if (!isolated || isolated.trim() !== "false") {
            if (node.data.scope.__proto__ === Object.prototype) {
              node.data.scope = {};
            } else {
              node.data.scope.__proto__ = Object.prototype;
            }
          }
          var component = this.mount(element, node.tagName, node.data, node.data.scope, node.data.component, children);
        }).bind(this),
        remove: (function (node, element) {
          this.tree().unmount(element.domLayerTreeId);
        }).bind(this)
      };

      return new _domLayerSrcNodeTag2["default"](tagName, config);
    }

    /**
     * Shallow flattens a one level nested array of virtual nodes into a flat array.
     *
     * @param  Array input The nested array of virtual nodes.
     * @return Array       A flattened array of virtual nodes.
     */
  }, {
    key: "flatten",
    value: function flatten(input) {
      var output = [],
          idx = 0;
      for (var i = 0, length = input.length; i < length; i++) {
        var value = input[i];
        if (_util2["default"].isArray(value)) {
          var j = 0,
              len = value.length;
          output.length += len;
          while (j < len) {
            output[idx++] = value[j++];
          }
        } else {
          output[idx++] = value;
        }
      }
      return output;
    }

    /**
     * Replaces undefined value by an empty string.
     * If the passed value is an object, it'll casted into a string based
     * on its keys where all keys with a `false` values will be removed.
     *
     * Example:
     * { a: true, b: false, c: "hello" } => "a c"
     *
     *
     * @param  mixed value The value to beautify.
     * @return mixed       The beautified value.
     */
  }, {
    key: "beautify",
    value: function beautify(value) {
      if (value === undefined) {
        return '';
      }
      if (!_util2["default"].isPlainObject(value)) {
        return value;
      }
      var values = [];
      _util2["default"].each(value, function (v, k) {
        if (v) {
          values.push(k);
        }
      });
      return values.join(" ");
    }

    /**
     * Casts a JS value.
     * It casts a value according a casting function.
     *
     * @param  mixed    value The value to cast.
     * @param  Function cast  A casting function.
     * @return mixed          The casted value.
     */
  }, {
    key: "cast",
    value: function cast(value, _cast) {
      return _cast ? _cast(value) : value;
    }

    /**
     * Mounts a DOM node from a Tag name & emits `'unmount'`/`'umounted'` events.
     *
     * @param  mixed    selector The DOM container node or a string selector.
     * @param  String   tagName  The tag name to instanciate.
     * @param  Object   data     The data to embbed.
     * @param  Object   scope    The scope to use for initializing the tag.
     * @param  Object   parent   An optionnal parent tag reference.
     * @return Object            A payload with the following keys:
     *                           -`'component'`       _Object_    : The created tag instance.
     *                           -`'container'` _DOMElement_: The container.
     */
  }, {
    key: "mount",
    value: function mount(selector, tagName, data, scope, parent, content) {
      var containers = _domQuery2["default"].all(selector);
      if (!containers.length) {
        return;
      }
      if (containers.length > 1) {
        for (var i = 0, len = containers.length; i < len; i++) {
          this.mount(containers[i]);
        }
        return;
      }

      var container = containers[0];

      var component = this._components.create(tagName, {
        renderer: this,
        scope: scope,
        data: data,
        parent: parent,
        content: content
      });

      component.emit('mount');
      component.domLayerTreeId = this._tree.mount(container, component.render.bind(component), { component: component });
      component.emit('refresh');

      return component;
    }

    /**
     * Unmounts a single component.
     *
     * @param mixed component The component.
     */
  }, {
    key: "unmount",
    value: function unmount(component) {
      this._tree.unmount(component.domLayerTreeId);
    }

    /**
     * Refreshes components or a single component.
     */
  }, {
    key: "refresh",
    value: function refresh(component) {
      if (arguments.length) {
        if (!component.dirty() || component.onrefresh) {
          return;
        }
        component.onrefresh = true;
        component.emit('update');
        this._tree.update(component.domLayerTreeId);
        component.emit('updated');
        component.onrefresh = false;
        component.dirty(false);
        return;
      }
      var mountId,
          mounted = this._tree.mounted();
      for (mountId in mounted) {
        this.refresh(mounted[mountId].component);
      }
    }
  }]);

  return Renderer;
})();

exports["default"] = Renderer;
module.exports = exports["default"];

},{"./components":39,"./modifiers/each":40,"./modifiers/if":41,"./util":43,"dom-layer/src/node/tag":14,"dom-layer/src/node/text":15,"dom-layer/src/tree/tree":20,"dom-query":25}],43:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _extendMerge = require("extend-merge");

var _forEach = require("for-each");

var _forEach2 = _interopRequireDefault(_forEach);

var _toCamelCase = require("to-camel-case");

var _toCamelCase2 = _interopRequireDefault(_toCamelCase);

var _isNativeType = require("is-native-type");

var _isNativeType2 = _interopRequireDefault(_isNativeType);

var _copyClone = require("copy-clone");

var _copyClone2 = _interopRequireDefault(_copyClone);

var _path = require("./path");

var _path2 = _interopRequireDefault(_path);

var _string = require("./string");

var _string2 = _interopRequireDefault(_string);

var _ = {
    extend: _extendMerge.extend,
    merge: _extendMerge.merge,
    clone: _copyClone2["default"],
    each: _forEach2["default"],
    camelize: _toCamelCase2["default"],
    noop: function noop() {
        return function () {};
    }
};
(0, _extendMerge.extend)(_, _isNativeType2["default"]);
(0, _extendMerge.extend)(_, _path2["default"]);
(0, _extendMerge.extend)(_, _string2["default"]);

exports["default"] = _;
module.exports = exports["default"];

},{"./path":44,"./string":45,"copy-clone":4,"extend-merge":29,"for-each":31,"is-native-type":34,"to-camel-case":35}],44:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _ = {};

/**
 * Deeply set a value inside the view scope. Auto create Objects & Arrays when necessary.
 *
 * @param  String path The dotted notation notation path of the variable.
 * @return String      The setted value.
 */
_.set = function (object, path, value) {
  return parsePath(object, path, value);
};

/**
 * Deeply set a value inside the view scope. Auto create Objects & Arrays when necessary.
 *
 * @param  String path The dotted notation notation path of the variable.
 * @return String      The setted value.
 */
_.get = function (object, path) {
  return parsePath(object, path);
};

function parsePath(object, path, value) {
  if (typeof object !== "object") {
    throw new Error("Can't deeply get/set a value on an non object.");
  }

  if (!path) {
    return object;
  }

  var i, key, lastKey, last, current, isArray, keys, len, setMode;

  current = object;
  setMode = arguments.length === 3;
  keys = path.replace(/\[/g, "\x1b.").replace(/\]/g, "").split(".");
  len = keys.length;

  for (i = 0; i < len; i++) {
    key = keys[i];
    isArray = key.slice(-1) === '\x1b';
    lastKey = key = isArray ? key.slice(0, -1) : key;
    if (setMode && i < len - 1 && typeof current[key] !== "object") {
      current[key] = isArray ? [] : {};
    }
    last = current;
    current = current[key];
  }

  return setMode ? last[lastKey] = value : last[lastKey];
}

exports["default"] = _;
module.exports = exports["default"];

},{}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _ = {};

/**
 * Escapes string.
 *
 * @param  String str The string to escape.
 * @return String     The escaped string.
 */
_.escape = function (string) {
  return string.replace(/(\\|["'])/g, '\\$1');
};

/**
 * Escapes RegExp special characters.
 *
 * @param  String str The string to escape.
 * @return String     The escaped string.
 */
_.escapeRe = function (string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Converts HTML special characters to their entity equivalents.
 *
 * @param  String str The string to escape.
 * @return String     The escaped string.
 */
_.escapeHtml = function (string) {
  return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

/**
 * Converts the entity forms of special HTML characters to their normal form.
 *
 * @param  String str The string to unescape.
 * @return String     The unescaped string.
 */
_.unescapeHtml = function (string) {
  return string.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
};

/**
 * Strips quotes from a string
 *
 * @param  String         str The string with quotes.
 * @return String|Boolean     The unquoted string.
 */
_.unquote = function (string) {
  var a = string.charCodeAt(0);
  var b = string.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27) ? string.slice(1, -1) : false;
};

exports['default'] = _;
module.exports = exports['default'];

},{}]},{},[1])(1)
});