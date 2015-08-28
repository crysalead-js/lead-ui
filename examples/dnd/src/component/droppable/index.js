import ui from '../../../../..';
import template from './index.thtml';

var Component = ui.Component;
var _ = ui.util;

class Droppable extends Component {

  vm(scope, data, component) {

    _.extend(scope, {

      onEnter: function(event) {
        (data.onEnter || _.noop())(event.dataTransfer.getData('text'));
      },

      onLeave: function(event) {
        // Bails out when dragging over text
        try {
          if(event.target.nodeType === 3 || event.relatedTarget.nodeType === 3) {
            return;
          }
        }
        catch(err) {}

        (data.onLeave || _.noop())(event.dataTransfer.getData('text'));
      },

      onOver: function(event) {
        event.preventDefault();
        (data.onOver || _.noop())(event.dataTransfer.getData('text'));
      },

      onDrop: function(event) {
        event.preventDefault();
        (data.onDrop || _.noop())(event.dataTransfer.getData('text'));
      }

    });

  }

  template() {
    return template;
  }

}

export default Droppable;
