import _ from "../../../../../src/util";
import Component from '../../../../../src/component';
import template from './index.thtml';

class Droppable extends Component {

  vm(scope, data, component) {

    scope.onEnter = function(event) {
      (data.onEnter || _.noop())(event.dataTransfer.getData('text'));
    }

    scope.onLeave = function(event) {
      // Bails out when dragging over text
      try {
        if(event.target.nodeType === 3 || event.relatedTarget.nodeType === 3) {
          return;
        }
      }
      catch(err) {}

      (data.onLeave || _.noop())(event.dataTransfer.getData('text'));
    }

    scope.onOver = function(event) {
      event.preventDefault();
      (data.onOver || _.noop())(event.dataTransfer.getData('text'));
    }

    scope.onDrop = function(event) {
      event.preventDefault()
      (data.onDrop || _.noop())(event.dataTransfer.getData('text'));
    }

  }

  template() {
    return template;
  }

}

export default Droppable;
