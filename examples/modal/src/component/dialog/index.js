import Component from '../../../../../src/component';
import template from './index.thtml';

class Dialog extends Component {

  vm(scope, data, component) {

    scope.ok = function() {
      component.emit('close');
    }

    scope.cancel = function() {
      component.emit('cancel');
    }
  }

  template() {
    return template;
  }

}

export default Dialog;
