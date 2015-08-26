import _ from "../../../../../src/util";
import Component from '../../../../../src/component';
import template from './index.thtml';

class Draggable extends Component {

  vm(scope, data, component) {

    scope.dragId = data.dragId;

    scope.onStart = function(event) {
      event.dataTransfer.setData('text', scope.dragId);
      (data.onStart || _.noop())(scope.dragId);
    }

    scope.onEnd = function(event) {
      event.dataTransfer.getData('text');
      (data.onEnd || _.noop())(event.dataTransfer.getData('text'));
    }

  }

  template() {
    return template;
  }

}

export default Draggable;
