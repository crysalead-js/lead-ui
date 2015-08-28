import ui from '../../..';
import Example from './component/example';
import Draggable from './component/draggable';
import Droppable from './component/droppable';

ui.domLayer.events.init();

var renderer = new ui.Renderer();

var components = renderer.components();
components.register('example', Example);
components.register('draggable', Draggable);
components.register('droppable', Droppable);

renderer.mount('[router-viewport="index"]', 'example');
