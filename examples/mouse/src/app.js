import ui from '../../..';
import Example from './component/example';

ui.domLayer.events.init();

var renderer = new ui.Renderer();

var components = renderer.components();
components.register('example', Example);

renderer.mount('[router-viewport="index"]', 'example');
