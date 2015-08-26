import Component from '../../../../../src/component';
import template from './index.thtml';

class Example extends Component {

  vm(scope, data, component) {

    scope.squares = {};

    scope.numEnter = 0;

    scope.numLeave = 0;

    scope.active = false;

    scope.onEnter = function(event) {
      scope.numEnter++;
      scope.active = true;
    }

    scope.onLeave = function(event) {
      scope.numLeave++;
      scope.active = false;
    }

    scope.onDown = function(num) {
      scope.squares[num].down++;
    }

    scope.onUp = function(num) {
      scope.squares[num].up++;
    }

  }

  mount(scope) {
    for (var i = 0; i < 4; i++) {
      scope.squares[i] = { 'up': 0, 'down': 0 };
    }
  }

  template() {
    return template;
  }

}

export default Example;
