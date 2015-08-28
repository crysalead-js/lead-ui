import _ from "./util";
import Parser from "htmlparser2/lib/Parser";
import DomHandler from "./dom-handler";

class Transpiler {

  /**
   * The transpiler constructor.
   *
   * @param  Array options The options array. Possible values are:
   *                       - `'brackets'` Array   : the placeholder brackets.  (default: `['{{', '}}']`)
   */
  constructor(options) {
    options = options || {};
    this._domHandler = options.domHandler || Transpiler.domHandler;
    this._parser = options.parser || Transpiler.parser;
    this.brackets(options.brackets || ["{{", "}}"]);

    var open = _.escapeRe(this._brackets[0]), close = _.escapeRe(this._brackets[1]);
    this._bracketsRegex = RegExp("(?:^" + open + ")|(?:[^\\\\]" + open + ")(.*?)" + close, "g");
  }

  /**
   * Gets/sets the placeholder brackets.
   *
   * @param  Integer|Array    x Set it to `0` to get the open bracket, `1`to get the close bracket.
   *                            If x is an array, it'll be used as the new placeholder brackets.
   * @return String|undefined   The string bracket or `undefined` if used as a setter.
   */
  brackets(x) {
    if (!_.isArray(x)) {
      return this._brackets[x];
    }
    this._brackets = x;

    var openRe = _.escapeRe(this._brackets[0]);
    var closeRe = _.escapeRe(this._brackets[1]);
    var firstCharRe = _.escapeRe(this._brackets[0].charAt(0));
    var lastCharRe = _.escapeRe(this._brackets[1].charAt(this._brackets[1].length - 1));

    this._placeholder = new RegExp("(?!\\\\)(" + firstCharRe + "?" + openRe + ".*?" + closeRe + lastCharRe + "?)");
    this._safePlaceholder = new RegExp("(?!\\\\)(" + firstCharRe + openRe + ".*?" + closeRe + lastCharRe + ")");

  }

  /**
   * Returns the placeholder RegEx.
   *
   * @param  Boolean safe If `true` returns the safe version of the placeholder RegEx.
   * @return String       The placeholder RegEx.
   */
  placeholder(safe) {
    return safe ? this._safePlaceholder : this._placeholder;
  }

  /**
   * Transpile an HTML template into a javascript virtual dom template.
   *
   * 1. Expressions: compile("{{ value }}");
   *    Returns an evaluable hyperscript string template.
   *
   * 2. Transpilers: compile("<title>Hi {{ name }} {{ surname }}</title>");
   *    Returns an evaluable hyperscript string template.
   *
   * @param  String template And HTML template.
   * @return String          An evaluable hyperscript template.
   */
  transpile(template) {
    if (!template) {
      return '[]';
    }
    this._parser.parseComplete(template.trim());
    var dom = this._domHandler.dom;
    if (dom.length !== 1) {
      throw new Error("View templates require an unique root element.");
    }
    return this._compileNode(dom[0]);
  }

  /**
   * Compiles an single fake dom node value into a hyperscript template string definition.
   *
   * @param  String node An object representing a dom node from the html parser.
   * @return String      An evaluable hyperscript template.
   */
  _compileNode(dom) {
    dom = _.clone(dom);
    if (dom.type === "tag") {
      var i, tagName, attrs, body = [];

      for (i = 0; i < dom.children.length; i++) {
        body.push(this._compileNode(dom.children[i]));
      }

      tagName = dom.name.toLowerCase();
      attrs = dom.attrs || {};

      var context = [], propPairs = [], attrPairs = [], eventPairs = [], dataPairs = [];

      _.each(attrs, function(value, name) {
        if (name === "xmlns") {
          context.push(JSON.stringify("namespace") + ':' + this.stringifiable(value));
        } else if (name.substr(0, 3) === 'on-') {
          name = 'on' + name.substr(3);
          eventPairs.push(JSON.stringify(name) + ':' + this.eventifiable(name, value));
        } else if (name.substr(0, 5) === 'data-') {
          name = name.substr(5);
          dataPairs.push(JSON.stringify(_.camelize(name)) + ':' + this.data(value));
        } else {
          attrPairs.push(JSON.stringify(_.camelize(name)) + ':' + this.stringifiable(value));
        }
      }.bind(this));

      if (attrPairs.length) {
        context.push("attrs:{" + attrPairs.join(",") + "}");
      }
      if (eventPairs.length) {
        context.push("events:{" + eventPairs.join(",") + "}");
      }
      if (dataPairs.length) {
        context.push("data:{" + dataPairs.join(",") + "}");
      }

      return Transpiler.renderer + ".h("
        + JSON.stringify(tagName) + ","
        + "{" + context.join(",") + "},"
        + "function(s){return " + Transpiler.renderer + ".flatten([" + body.join(",") + "]);},s,c)";
    }
    if (dom.type === "text") {
      return Transpiler.renderer + ".h(null," + this.stringifiable(dom.data.replace(/\s+/g, " ")) + ",s,c)";
    }
  }

  /**
   * Tokenizes a template text string into an array of tokens.
   *
   * @param  String text
   * @return Array       An array of tokens with the following format:
   *                     - `'expr'`  Boolean: Indicate if it's a expression or not.
   *                     - `'value'` String : The value of the token.
   *                     - `'safe'`  Boolean: Indicate if the value is safe or need to be escaped.
   */
  tokenize(text) {
    if (!this.placeholder().test(text)) {
      return [{ expr: false, value: text }];
    }

    var openLen, closeLen, matches, value, safe, tokens = [], self = this;

    matches = text.split(this.placeholder());
    openLen = this.brackets(0).length;
    closeLen = this.brackets(1).length;

    matches.map(function(match, i) {
      if (i % 2) {
        safe = self.placeholder(true).test(match);
        value = match.slice(openLen, -closeLen);
        value = safe ? value.slice(1, -1).trim() : value.trim();
        if (value) {
          tokens.push({ expr: true, value: value, safe: safe });
        }
      } else if (match) {
        tokens.push({ expr: false, value: match });
      }
    });
    return tokens;
  }

  /**
   * Turns an expression template string with placeholder into some javascript code.
   *
   * @param  String text The expression string with placeholder.
   * @return String      Some javascript which build a string on evaluation.
   */
  stringifiable(text) {
    return this.evaluable(text, 'String');
  }

  /**
   * Turns an expression template string with placeholder into some javascript code.
   *
   * @param  String text The expression string with placeholder.
   * @return String      Some javascript which build a value on evaluation.
   */
  data(text) {
    var tokens, expressions, len, v, s, r;
    tokens = this.tokenize(text);
    len = tokens.length;

    var token = tokens[0];
    if (tokens.length !== 1 && !token.expr) {
      throw new Error("Invalid data reference");
    }

    return "function(s){return " + this.scopify(token.value) + ";}";
  }

  /**
   * Turns an expression template string with placeholder into some javascript code.
   *
   * @param  String text The expression string with placeholder.
   * @return String      Some javascript which build a value on evaluation.
   */
  evaluable(text, cast) {
    var tokens, expressions, len, v, s, r;
    tokens = this.tokenize(text);
    len = tokens.length;

    if (tokens.length === 1 && tokens[0].expr === false) {
      return JSON.stringify(tokens[0].value);
    }

    expressions = tokens.map(function(token, i) {
      if (!token.expr) {
        return JSON.stringify(token.value);
      }
      return Transpiler.renderer + ".beautify(" + this.scopify(token.value) + ")";
    }.bind(this));

    v = expressions.length ? expressions.join("+") : '""';

    return "function(s){try{var v=" + Transpiler.renderer + ".cast(" + v + "," + cast + ");}finally{return v;}}";
  }

  /**
   * Turns an placeholder string into some javascript code.
   *
   * @param  String text A placeholder
   * @return String      Some javascript which build a "callable function" on evaluation.
   */
  eventifiable(name, text) {
    var tokens, expressions, len, c, self = this;
    tokens = this.tokenize(text);
    len = tokens.length;

    expressions = tokens.filter(function(token) {
      return token.expr;
    }).map(function(token) {
      return self.scopify(token.value);
    });
    return "function " + name + "($e, $value, $node){var s = $node.data.scope;try{" + expressions.join(";") + "}finally{c.invalidate($e, $value);}}";
  }

  /**
   * Prefixes variable name with the scope name (i.e `scope.myVar`).
   *
   * @param  String text A placeholder
   * @return String      Some javascript which build a "callable function" on evaluation.
   */
  scopify(value) {
    return value.replace(Transpiler.REGEX_VARS, function(expr, _, v) {
      return v && v.charAt(0) !== "$" ? Transpiler.scope + "." + v : expr
    });
  }
}

/**
 * Defaults template values.
 */
Transpiler.renderer = "$";

Transpiler.scope = 's';

Transpiler.domHandler = new DomHandler();

Transpiler.parser = new Parser(Transpiler.domHandler);

Transpiler.REGEX_VARS = /(['"\/]).*?[^\\]\1|\.\w*|\w*:|\b(?:new|typeof|in|instanceof) |(?:this|true|false|null|undefined)\b|(?:function *\()|([a-z_$]\w*)/gi;
                    // [        1       ] [ 2 ] [ 3] [                                        4                                          ] [    5     ]
                    // find variable names:
                    // 1. skip quoted strings and regexps: "a b", 'a b', 'a \'b\'', /a b/
                    // 2. skip object properties: .name
                    // 3. skip object literals: name:
                    // 4. skip javascript keywords
                    // 5. match var name

export default Transpiler;