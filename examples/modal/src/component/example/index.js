import ui from '../../../../..';
import template from './index.thtml';
import Modal from '../../widget/modal';

var Component = ui.Component;
var _ = ui.util;

class Example extends Component {

  vm(scope, data, component) {

    _.extend(scope, {

      list: [],

      modal: function(effect) {
        Modal.open('example', {
          title: "Modal Title"
        }).then(function(scope) {
          console.log("Ok");
        }, function() {
          console.log("Cancel");
        });
      },

      reverse: function() {
        scope.list = scope.list.reverse();
      }

    });

    for ( var i = 0; i < 10; i++ ) {
      scope.list.push( { value: i } );
    }

  }

  template() {
    return template;
  }

}

export default Example;
