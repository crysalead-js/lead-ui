import Component from '../src/component';

describe("Component", function() {

  var component;

  beforeEach(function() {
    component = new Component();
  });

  describe(".set()", function() {

    it("gets/sets data", function() {

      component.set('title', "The Title");
      component.set('body', "Hello world");

      expect(component.get()).toEqual({ title: "The Title", body: "Hello world" });
      expect(component.get('title')).toBe("The Title");
      expect(component.get('body')).toBe("Hello world");
    });


  });

});