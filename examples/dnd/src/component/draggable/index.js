import ui from '../../../../..';
import template from './index.thtml';

var Component = ui.Component;
var _ = ui.util;

class Draggable extends Component {

  vm(scope, data, component) {

    _.extend(scope, {

      dragId: data.dragId,

      onStart: function(event) {
        event.dataTransfer.setData('text', scope.dragId);
        (data.onStart || _.noop())(scope.dragId);
      },

      onEnd: function(event) {
        event.dataTransfer.getData('text');
        (data.onEnd || _.noop())(event.dataTransfer.getData('text'));
      }

    });

  }

  template() {
    return template;
  }

}

export default Draggable;
