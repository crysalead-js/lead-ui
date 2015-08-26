import _ from "../../../../../src/util";
import Component from '../../../../../src/component';
import template from './index.thtml';

class Example extends Component {

  vm(scope, data, component) {

    scope.products = {
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
    };

    scope.cart = {};

    scope.total = 0;

    scope.active = false;

    scope.dragStart = function(id) {
      component.set('active', true);
    }

    scope.dragEnd = function(id) {
      component.set('active', false);
    }

    scope.drop = function(id) {
      scope.cart[id] = scope.cart[id] ? scope.cart[id] + 1 : 1;
      scope.total = 0;
      _.each(scope.cart, function(qty, id) {
        scope.total = scope.total + qty * scope.products[id].price;
      });
    }

  }

  template() {
    return template;
  }

}

export default Example;
