var _ = {};

/**
 * Escapes string.
 *
 * @param  String str The string to escape.
 * @return String     The escaped string.
 */
_.escape = function(string) {
  return string.replace(/(\\|["'])/g, '\\$1');
}

/**
 * Escapes RegExp special characters.
 *
 * @param  String str The string to escape.
 * @return String     The escaped string.
 */
_.escapeRe = function(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Converts HTML special characters to their entity equivalents.
 *
 * @param  String str The string to escape.
 * @return String     The escaped string.
 */
_.escapeHtml = function(string) {
  return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Converts the entity forms of special HTML characters to their normal form.
 *
 * @param  String str The string to unescape.
 * @return String     The unescaped string.
 */
_.unescapeHtml = function(string) {
  return string.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

/**
 * Strips quotes from a string
 *
 * @param  String         str The string with quotes.
 * @return String|Boolean     The unquoted string.
 */
_.unquote = function(string) {
  var a = string.charCodeAt(0);
  var b = string.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27) ? string.slice(1, -1) : false;
};

export default _;
