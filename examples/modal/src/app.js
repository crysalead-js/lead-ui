import ui from '../../..';
import Modal from './widget/modal';
import Example from './component/example';
import Dialog from './component/dialog';

ui.domLayer.events.init();

var renderer = new ui.Renderer();

var components = renderer.components();
components.register('example', Example);
components.register('dialog', Dialog);

Modal.config({ renderer: renderer });

renderer.mount('[router-viewport="index"]', 'example');
