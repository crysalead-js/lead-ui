import ui from '../../../../..';
import template from './index.thtml';

var Component = ui.Component;
var _ = ui.util;

class Dialog extends Component {

  vm(scope, data, component) {

    _.extend(scope, {

      ok: function() {
        component.emit('close');
      },

      cancel: function() {
        component.emit('cancel');
      }

    });
  }

  template() {
    return template;
  }

}

export default Dialog;
