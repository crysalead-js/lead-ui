import _ from "../util";

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

  _.each(list, function(value, key) {
    var clone = {
      props: properties.props,
      attrs: _.extend({}, properties.attrs),
      events: properties.events,
      callbacks: properties.callbacks,
      namespace: properties.namespace,
      data: _.extend({}, properties.data)
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

export default _each;