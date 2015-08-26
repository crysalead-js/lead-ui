import domLayer from 'dom-layer';
import Renderer from '../../../src/renderer';
import Example from './component/example';
import Draggable from './component/draggable';
import Droppable from './component/droppable';

domLayer.events.init();

var renderer = new Renderer();

var components = renderer.components();
components.register('example', Example);
components.register('draggable', Draggable);
components.register('droppable', Droppable);

renderer.mount('[router-viewport="index"]', 'example');
