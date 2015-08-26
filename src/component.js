import Emitter from "component-emitter";
import _ from "./util";

class Component {

  /**
   * The view constructor.
   *
   * @param String   template An evaluable hyperscript template. (default: `"[];"`).
   * @param Function renderer The DSL function to use for creating virtual DOM. (default: `h`)
   */
  constructor(options) {
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
  content(content) {
    if (content) {
      this._content = content;
    }
    return this._content;
  }

  /**
   * Returns the view renderer string template. If a string template exists,
   * it will be compiled and used instead of the `_template` variable.
   *
   * @return String An evaluable renderer template.
   */
  template(template) {
    if (template) {
      this._template = template;
    }
    return this._template;
  }

  /**
   * Returns the virtual DOM builder function of this view instance.
   *
   * @return Function The virtual DOM builder.
   */
  renderer(renderer) {
    if (renderer) {
      this._renderer = renderer;
    }
    return this._renderer;
  }

  /**
   * Returns the virtual DOM generated during the last `build()` call.
   *
   * @return Object The last built virtual DOM.
   */
  virtual() {
    return this._virtual;
  }

  /**
   * Returns the component's children.
   *
   * @return Object The component's children.
   */
  children() {
    return this._children;
  }

  /**
   * Returns the parent component.
   *
   * @return Object The parent component instance.
   */
  parent() {
    return this._parent;
  }

  /**
   * Gets/Sets the dirty flag.
   *
   * @param  Boolean value A `true`/`false` value or none to get the value.
   * @return Boolean       The dirty value.
   */
  dirty(value) {
    if (arguments.length) {
      this._dirty = !!value;
      if (this._dirty) {
        _.each(this.children(), function(child) {
          child.dirty(true);
        }.bind(this));
        this.emit("refresh");
      }
    }
    return this._dirty;
  }

  invalidate() {
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
  register(ref, child) {
    this._children[ref] = child;
  }

  /**
   * Unregisters a child component.
   *
   * @param  String ref The name reference of the child.
   */
  unregister(ref) {
    delete this._children[ref];
  }

  /**
   * Renders a html string.
   *
   * @param  Object data The data to use for the rendering.
   * @return String      An html template.
   */
  toHtml() {
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
  set(path, value) {
    var value = _.set(this._scope, path, value);
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
  get(path) {
    return _.get(this._scope, path);
  }

  /**
   * Returns a virtual DOM.
   *
   * @param  Object scope The data to use for the rendering.
   * @return mixed        The generated virtual DOM.
   */
  render() {
    var node = Function('$', 's', 'c', "return " + this.template())(this.renderer(), this.get(), this);
    node = _.isArray(node) ? node[0] : node;
    if (!node) {
      return;
    }
    node.hooks = {
      created: function(node, element) {
        this.on('refresh', function() {
          this.renderer().refresh(this);
        }.bind(this));
        this.emit('mounted', element);
      }.bind(this),
      dirty: function(node) {
        return this.dirty();
      }.bind(this),
      remove: function(node, element) {
        this.emit('unmounted', element);
      }.bind(this)
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

   vm(scope, data, component) {
   }

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
}

Emitter(Component.prototype);

Component.counter = 1;

Component.prototype._emit = Component.prototype.emit;

/**
 * Emits an event.
 *
 * @param  String  event The event name to emit.
 * @return Boolean       Returns true if event had listeners, false otherwise.
 */
Component.prototype.emit = function(event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var methodArgs = args.slice();
  methodArgs.unshift(this._scope);
  methodArgs.unshift(event);
  if (_.isFunction(this[event])) {
    this[event].apply(this, methodArgs.slice(1));
  }
  return this._emit.apply(this, methodArgs);
}

export default Component;