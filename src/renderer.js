import query from "dom-query";
import Tree from "dom-layer/src/tree/tree";
import Tag from 'dom-layer/src/node/tag';
import Text from 'dom-layer/src/node/text';
import Components from "./components";
import _ from "./util";
import _if from "./modifiers/if";
import _each from "./modifiers/each";

class Renderer {
  /**
   * Renderer constructor.
   */
  constructor(options) {
    options = options || {};
    this._modifiers = {};
    this._ordered = [];
    this._tree = options.tree || new Tree();
    this._components = options.components || new Components();
    this.register('if', _if);
    this.register('each', _each);
  }

  /**
   * Gets/sets the tree instance.
   *
   * @return object The tree instance.
   */
  tree(tree) {
    if (tree) {
      this._tree = tree;
    }
    return this._tree;
  }

  /**
   * Gets/sets the components instance.
   *
   * @return Object The components instance.
   */
  components(components) {
    if (components) {
      this._components = components;
    }
    return this._components;
  }

  /**
   * Registers a modifier.
   *
   * @param String   name      The modifier name to register.
   * @param Function className The class to use for this modifier name.
   */
  register(name, className) {
    this._ordered.push(name);
    this._modifiers[name] = className;
  }

  /**
   * Unregisters a modifier.
   *
   * @param String name The modifier name to unregister.
   */
  unregister(name) {
    var index = this._ordered.indexOf(name);
    if (index > -1) {
      this._ordered.splice(index, 1);
      this._ordered = this._ordered.map(function(v) {
        return this._ordered[v];
      }.bind(this));
    }
    delete this._modifiers[name];
  }

  /**
   * Lists registered modifiers.
   *
   * @return Array The array of registered widget names.
   */
  registered() {
    return this._ordered;
  }

  /**
   * Checks if a modifier exists.
   *
   * @param  String  name The modifier name to check.
   * @return Boolean      Returns `true` is the modifier exists `false` otherwise.
   */
  exists(name) {
    return !!this._modifiers[name];
  }

  /**
   * Gets the priority of a modifier.
   *
   * @param  String  name The modifier name to unregister.
   * @return Integer      Returns the modifier priority.
   */
  priority(name) {
    return this._ordered.indexOf(name);
  }

  /**
   * Builds a virtual dom tree using the virtual dom DSL.
   *
   * @param  Object vdef       The virtual node definition. Possible values are:
   *                           -`'config'`  _Object_   : An object that describe the virtual node
   *                                                       (e.g. `{ tagName: "span", props: { className: "bar" } }`).
   *                           -`'children'` _Function_ : A function which returns an array of children
   *                           -`'<data>'`   _mixed_    : Some custom data to attach to the virtual node.
   * @param  Function children A function which return an array of any combination of virtual nodes.
   * @return Array             A flattened array of virtual nodes.
   */
  h(tagName, config, children, scope, component) {
    var modifiers = [];

    if (!tagName) {
      return _.isFunction(config) ? new Text(config(children)) : new Text(config);
    }

    config.data = config.data  || {};
    config.data.scope = scope;
    config.data.component = component;

    _.each(config.attrs, function(value, name, attrs) {
      if (name === "component") {
        tagName = value(scope);
        delete attrs[name];
      } else if (this.exists(name)) {
        modifiers.push({ name: name, value: value, p: this.priority(name) });
        delete attrs[name];
      }
    }.bind(this));

    modifiers = modifiers.sort(function(a, b){ return a.p - b.p; });

    var nodes = this._transform(modifiers, tagName, config, children);

    return _.isArray(nodes) ? nodes : [nodes];
  }

  /**
   * Transforms an hyperscript node into a nested array of virtual dom definition using
   * the virtual dom DSL (i.e. using `Tag`)
   *
   * @param  Object vdef See the `h()` function for details.
   * @return Array       A flattened array of virtual nodes.
   */
  _transform(modifiers, tagName, config, children) {
    if (modifiers.length) {
      var statement = modifiers.shift();
      var modifier = this._modifiers[statement.name];
      var params = modifier(statement.value, config);

      return params.map(function(param) {
        return this._transform(modifiers, tagName, param, children);
      }.bind(this));
    }

    var scope = config.data.scope;
    var component = config.data.component;

    if (tagName === 'content') {
      var content = component.content();
      var parent = component.parent();
      var contentScope;

      if (parent) {
        contentScope = _.extend({}, scope);
        contentScope.__proto__ = component.parent().get();
      } else {
        contentScope = scope;
      }

      return content ? content(contentScope, component) : [];
    }

    _.each(config.attrs, function(value, name, attrs) {
      if (_.isFunction(value)) {
        attrs[name] = value(scope);
      }
    });

    _.each(config.data, function(value, name, data) {
      if (_.isFunction(value)) {
        data[name] = value(scope);
      }
    });

    if (this._components.exists(tagName)) {
      return this._createComponent(tagName, config, children);
    }
    return new Tag(tagName, config, children ? children(scope, component) : []);
  }

  /**
   * Returns a the virtual tag node.
   *
   * @param  Object config See the `h()` function for details.
   * @return Object        A virtual tag node.
   */
  _createComponent(tagName, config, children) {
    config.hooks = {
      created: function(node, element) {
        var isolated = node.attrs && node.attrs.isolated;
        if (!isolated || isolated.trim() !== "false") {
          if (node.data.scope.__proto__ === Object.prototype) {
            node.data.scope = {};
          } else {
            node.data.scope.__proto__ = Object.prototype;
          }
        }
        var component = this.mount(element, node.tagName, node.data, node.data.scope, node.data.component, children);
      }.bind(this),
      remove: function(node, element) {
        this.tree().unmount(element.domLayerTreeId);
      }.bind(this)
    };

    return new Tag(tagName, config);
  }

  /**
   * Shallow flattens a one level nested array of virtual nodes into a flat array.
   *
   * @param  Array input The nested array of virtual nodes.
   * @return Array       A flattened array of virtual nodes.
   */
  flatten(input) {
    var output = [], idx = 0;
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (_.isArray(value)) {
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else {
        output[idx++] = value;
      }
    }
    return output;
  }

  /**
   * Replaces undefined value by an empty string.
   * If the passed value is an object, it'll casted into a string based
   * on its keys where all keys with a `false` values will be removed.
   *
   * Example:
   * { a: true, b: false, c: "hello" } => "a c"
   *
   *
   * @param  mixed value The value to beautify.
   * @return mixed       The beautified value.
   */
  beautify(value) {
    if (value === undefined) {
      return '';
    }
    if (!_.isPlainObject(value)) {
      return value;
    }
    var values = [];
    _.each(value, function(v, k) {
      if (v) {
        values.push(k);
      }
    });
    return values.join(" ");
  }

  /**
   * Casts a JS value.
   * It casts a value according a casting function.
   *
   * @param  mixed    value The value to cast.
   * @param  Function cast  A casting function.
   * @return mixed          The casted value.
   */
  cast(value, cast) {
    return cast ? cast(value) : value;
  }

  /**
   * Mounts a DOM node from a Tag name & emits `'unmount'`/`'umounted'` events.
   *
   * @param  mixed    selector The DOM container node or a string selector.
   * @param  String   tagName  The tag name to instanciate.
   * @param  Object   data     The data to embbed.
   * @param  Object   scope    The scope to use for initializing the tag.
   * @param  Object   parent   An optionnal parent tag reference.
   * @return Object            A payload with the following keys:
   *                           -`'component'`       _Object_    : The created tag instance.
   *                           -`'container'` _DOMElement_: The container.
   */
  mount(selector, tagName, data, scope, parent, content) {
    var containers = query.all(selector);
    if (!containers.length) {
      return;
    }
    if (containers.length > 1) {
      for(var i = 0, len = containers.length; i < len; i++) {
        this.mount(containers[i]);
      }
      return;
    }

    var container = containers[0];

    var component = this._components.create(tagName, {
      renderer: this,
      scope: scope,
      data: data,
      parent: parent,
      content: content
    });

    component.emit('mount');
    component.domLayerTreeId = this._tree.mount(container, component.render.bind(component), { component: component });
    component.emit('refresh');

    return component;
  }

  /**
   * Unmounts a single component.
   *
   * @param mixed component The component.
   */
  unmount(component) {
    this._tree.unmount(component.domLayerTreeId);
  }

  /**
   * Refreshes components or a single component.
   */
  refresh(component) {
    if (arguments.length) {
      if (!component.dirty() || component.onrefresh) {
        return;
      }
      component.onrefresh = true;
      component.emit('update');
      this._tree.update(component.domLayerTreeId);
      component.emit('updated');
      component.onrefresh = false;
      component.dirty(false);
      return;
    }
    var mountId, mounted = this._tree.mounted();
    for (mountId in mounted) {
      this.refresh(mounted[mountId].component);
    }
  }
}

export default Renderer;