var _ = {};

/**
 * Deeply set a value inside the view scope. Auto create Objects & Arrays when necessary.
 *
 * @param  String path The dotted notation notation path of the variable.
 * @return String      The setted value.
 */
_.set = function(object, path, value) {
  return parsePath(object, path, value);
}

/**
 * Deeply set a value inside the view scope. Auto create Objects & Arrays when necessary.
 *
 * @param  String path The dotted notation notation path of the variable.
 * @return String      The setted value.
 */
_.get = function(object, path) {
  return parsePath(object, path);
}

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

export default _;