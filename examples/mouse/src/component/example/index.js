import ui from '../../../../..';
import template from './index.thtml';

var Component = ui.Component;
var _ = ui.util;

class Example extends Component {

  vm(scope, data, component) {

    _.extend(scope, {

      squares: {},

      numEnter: 0,

      numLeave: 0,

      active: false,

      onEnter: function(event) {
        scope.numEnter++;
        scope.active = true;
      },

      onLeave: function(event) {
        scope.numLeave++;
        scope.active = false;
      },

      onDown: function(num) {
        scope.squares[num].down++;
      },

      onUp: function(num) {
        scope.squares[num].up++;
      }

    });

    for (var i = 0; i < 4; i++) {
      scope.squares[i] = { 'up': 0, 'down': 0 };
    }

  }

  template() {
    return template;
  }

}

export default Example;
