import ui from '../../../../..';
import template from './index.thtml';

var Component = ui.Component;
var _ = ui.util;

class Example extends Component {

  vm(scope, data, component) {

    _.extend(scope, {

      products: {
        imac: {
          name: 'iMac',
          price: 1199
        },
        iphone: {
          name: 'iPhone',
          price: 199
        },
        appletv: {
          name: 'AppleTV',
          price: 299
        },
        display: {
          name: 'Cinema Display',
          price: 899
        },
        ipod: {
          name: 'iPod Nano',
          price: 149
        },
        macbook: {
          name: 'Macbook',
          price: 1199
        },
        mini: {
          name: 'Mac Mini',
          price: 599
        }
      },

      cart: {},

      total: 0,

      active: false,

      dragStart: function(id) {
        component.set('active', true);
      },

      dragEnd: function(id) {
        component.set('active', false);
      },

      drop: function(id) {
        scope.cart[id] = scope.cart[id] ? scope.cart[id] + 1 : 1;
        scope.total = 0;
        _.each(scope.cart, function(qty, id) {
          scope.total = scope.total + qty * scope.products[id].price;
        });
      }

    });

  }

  template() {
    return template;
  }

}

export default Example;
