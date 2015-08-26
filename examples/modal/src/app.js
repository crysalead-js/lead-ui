import domLayer from 'dom-layer';
import Renderer from '../../../src/renderer';
import Modal from './widget/modal';
import Example from './component/example';
import Dialog from './component/dialog';

domLayer.events.init();

var renderer = new Renderer();

var components = renderer.components();
components.register('example', Example);
components.register('dialog', Dialog);

Modal.config({ renderer: renderer });

renderer.mount('[router-viewport="index"]', 'example');
