import ui from '../../../..';

var _ = ui.util;

class Modal {

  static config(options) {
    _.each(options, function(value, key) {
      Modal[key] = value;
    });
  }

  static open(tagName, scope, options) {

    if (!Modal.renderer) {
      throw new Error("No rendered has been configured for Modal.")
    }

    var nodes, config = {};

    scope.tagName = tagName;
    options = options || {};

    _.each(Modal.options, function(value, key) {
      config[key] = options[key] || value;
    });

    if (config.backdrop) {
      nodes = [["backdrop", document.createElement("div")]];
    } else {
      nodes = [];
    }

    var modal = document.createElement("div");
    var component = Modal.renderer.mount(modal, config.tagName, {}, scope);
    nodes.push(["modal", modal]);

    _.each(nodes, function(item) {
      var name = item[0];
      var element = item[1];

      element.className = config[name + 'Class'];
      document.body.appendChild(element);
      element.style.zIndex = config.zIndex++;
      element.style.display = "block";
      setTimeout(function() {
        if (config[name + 'ShowClass']) {
          element.classList.add(config[name + 'ShowClass']);
        }
      }, 25);
    });

    var destroy = function() {
      Modal.renderer.unmount(component);
      _.each(nodes, function(item) {
        item[1].parentNode.removeChild(item[1]);
      });
      config.zIndex -= 2;
    };

    var promise = new Promise(function(resolve, reject) {
      component.on('close', function(scope) {
        resolve(scope);
        destroy();
      });
      component.on('cancel', function(scope) {
        reject();
        destroy();
      });
    });

    component.then = promise.then.bind(promise);
    return component;
  }
}

Modal.options = {
  tagName: "dialog",
  zIndex: 10050,
  backdrop: true,
  modalClass: "modal fade",
  modalShowClass: "in",
  backdropClass: "modal-backdrop fade",
  backdropShowClass: "in"
};

export default Modal;
