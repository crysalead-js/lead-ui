import _ from "./util";

class DomHandler {

  constructor() {
    this._reset();
  }

  oninitparser(paser, options) {
    options.eagerTextCapture = true;
  }

  onopentag(name, attributes) {
    var attrs = {};
    _.each(attributes, function(value, key) {
      attrs[key] = value;
    });
    var element = {
      type: (name === "script" || name === "style") ? name : "tag",
      name: name,
      attrs: attrs,
      children: []
    };

    this._addDomElement(element);
    this._tagStack.push(element);
  }

  onclosetag() {
    this._tagStack.pop();
  }

  ontext(data) {
    this._addDomElement({
      data: _.unescapeHtml(data),
      type: "text"
    });
  }

  onreset() {
    this._reset();
  }

  _addDomElement(element) {
    var parent = this._tagStack[this._tagStack.length - 1];
    var siblings = parent ? parent.children : this.dom;
    siblings.push(element);
  }

  _reset() {
    this.dom = [];
    this._tagStack = [];
  }
}

export default DomHandler;
