import Component from '../src/component';
import Transpiler from '../src/transpiler';
import Renderer from '../src/renderer';

describe("Template", function() {

  var transpiler = new Transpiler();
  var renderer = new Renderer();

  function build(text, scope) {
    return new Component({
      scope: scope,
      template: new Function('$', 's', 'c', 'return ' + transpiler.transpile(text) + ';'),
      renderer: renderer
    });
  };

  describe(".compile()", function() {

    it("compiles a simple expression placeholder", function() {
      expect(build("{{ 1 }}").toHtml()).toBe("1");
      expect(build("{{ x }}", { x: 2 }).toHtml()).toBe("2");
      expect(build("{{ str }}", { str: "x" }).toHtml()).toBe("x");
      expect(build("{{ obj }}", { obj: { val: true } }).toHtml()).toBe("val");
      expect(build("{{ arr }}", { arr: [2, 3] }).toHtml()).toBe("2,3");
      expect(build("{{ fn('bob') }}", { fn: function(name) { return ["Hi", name].join(" ") } }).toHtml()).toBe("Hi bob");
      expect(build("{{ null }}", {}).toHtml()).toBe("null");
      expect(build("{{ yes }}", { yes: true }).toHtml()).toBe("true");
      expect(build("{{ no }}", { no: false }).toHtml()).toBe("false");

    });

    it("manages empty expressions", function() {

      expect(build().toHtml()).toBe("");
      expect(build("").toHtml()).toBe("");
      expect(build("{{}}").toHtml()).toBe("");
      expect(build("{{ }}").toHtml()).toBe("");
      expect(build("{{ }} ").toHtml()).toBe("");
      expect(build(" {{ }} ").toHtml()).toBe("");
      expect(build("Hello {{ }} World").toHtml()).toBe("Hello  World");

    });

    it("compiles an html template", function() {

      var view = build("<html><title>The Title</title><body>Hello world</body></html>");
      expect(view.toHtml()).toBe("<html><title>The Title</title><body>Hello world</body></html>");

    });

    it("compiles an html template with expression placeholders", function() {

      var template = "<html><title>{{ title }}</title><body>{{ body }}</body></html>";
      var view = build(template, { title: "The Title", body: "Hello world" });

      expect(view.toHtml()).toBe("<html><title>The Title</title><body>Hello world</body></html>");

    });

  });

  describe(".tokenize()", function() {

    var testCases = [
      {
        // no placeholder
        text: "abc",
        expected: [{ expr: false, value: "abc" }]
      },
      {
        // basic
        text: "a {{ a }} c",
        expected: [
          { expr: false, value: "a " },
          { expr: true, value: "a", safe: false },
          { expr: false, value: " c" }
        ]
      },
      {
        // safe
        text: "{{ text }} and {{{ html }}}",
        expected: [
          { expr: true, value: "text", safe: false },
          { expr: false, value: " and " },
          { expr: true, value: "html", safe: true },
        ]
      },
      {
        // mixed
        text: "[{{abc}}]",
        expected: [
          { expr: false, value: "[" },
          { expr: true, value: "abc", safe: false },
          { expr: false, value: "]" }
        ]
      }
    ];

    it("tokenizes expression template", function () {

      testCases.forEach(function(test) {
        expect(transpiler.tokenize(test.text)).toEqual(test.expected);
      });

    });

    it("tokenizes expression template with custom delimiters", function () {

      transpiler.brackets(["[%", "%]"]);
      var expected = [
        { expr: true, value: "text", safe: false },
        { expr: false, value: " and " },
        { expr: true, value: "html", safe: true }
      ];
      expect(transpiler.tokenize("[% text %] and [[% html %]]")).toEqual(expected);
      transpiler.brackets(["{{", "}}"]);

    });

  });

  describe(".stringifiable()", function() {

    function evaluate(js, scope) {
      return Function(Transpiler.renderer, "return " + js)(renderer)(scope);
    };

    it("makes expression template stringifiable", function () {
      var js = transpiler.stringifiable('view-{{test + 1}}-test-{{ok + "!"}}');
      expect(evaluate(js, { test: "hello", ok: "world" })).toBe("view-hello1-test-world!");
    });

    it("makes objects stringifiable", function () {
      var js = transpiler.stringifiable('{{ { foo: true, bar: false, baz: baz, boo: !hidden() } }}');
      expect(evaluate(js, {
        baz: false,
        hidden: function() {
          return false;
        }
      })).toBe("foo boo");
    });

  });

});