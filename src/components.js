class Components {

  /**
   * Tags constructor.
   *
   * @param Object options The options object. Possible options are:
   *                       -`'render'` _Function_: The logic for creating a DOM node from a VNode.
   */
  constructor(options) {
    options = options || {};
    this._components = {};
  }

  /**
   * Registers a tag name.
   *
   * @param String   name      The tag name to register.
   * @param Function className The view class to use for this tag name.
   */
  register(name, className) {
    this._components[name.toLowerCase()] = className;
  }

  /**
   * Unregisters a tag name.
   *
   * @param String name The tag name to unregister.
   */
  unregister(name) {
    delete this._components[name.toLowerCase()];
  }

  /**
   * Checks tag name existance.
   *
   * @param  String  name The tag name to unregister.
   * @return Boolean      Returns `true` is the tag exists `false` otherwise.
   */
  exists(name) {
    return name && !!this._components[name.toLowerCase()];
  }

  /**
   * Creates a tag instance.
   *
   * @param  String name The tag name to instanciate.
   * @return Object      A tag instance.
   */
  create(name, options) {
    options = options || {};
    if (!this.exists(name)) {
      throw new Error("Error, unexisting Tag `" + name + "`.");
    }
    name = name.toLowerCase();
    return new this._components[name](options);
  }

}

export default Components;
