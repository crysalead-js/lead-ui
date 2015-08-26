import Component from '../../../../../src/component';
import Modal from '../../widget/modal';
import template from './index.thtml';

class Example extends Component {

  vm(scope, data, component) {

    scope.list = [];

    for ( var i = 0; i < 10; i++ ) {
      scope.list.push( { value: i } );
    }

    scope.modal = function(effect) {
      Modal.open('example', {
        title: "Modal Title"
      }).then(function(scope) {
        console.log("Ok");
      }, function() {
        console.log("Cancel");
      });
    }

    scope.reverse = function() {
      scope.list = scope.list.reverse();
    }

  }

  template() {
    return template;
  }

}

export default Example;
