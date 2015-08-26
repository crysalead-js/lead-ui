import _ from "../../src/util";

describe("_", function() {

  describe(".get()/.set()", function() {

    it("gets/sets data", function() {

      var scope = {};

      _.set(scope, 'title', "The Title");
      _.set(scope, 'body', "Hello world");

      expect(_.get(scope)).toEqual({ title: "The Title", body: "Hello world" });
      expect(_.get(scope, 'title')).toBe("The Title");
      expect(_.get(scope, 'body')).toEqual("Hello world");
    });

    it("deeply gets/sets data", function() {

      var scope = {};
      var path = "title.body";

      _.set(scope, path, "Hello world");
      expect(_.get(scope)).toEqual({ title: { body: "Hello world" } });
      expect(_.get(scope, path)).toEqual("Hello world");

    });

    it("deeply gets/sets data with dot & square bracket notation", function() {

      var scope = {};
      var path = "title.body[0].value";

      _.set(scope, path, "Hello world");
      expect(_.get(scope)).toEqual({ title: { body: [{ value: "Hello world" }] } });
      expect(_.get(scope, path)).toEqual("Hello world");

    });

  });

});