import domLayer from 'dom-layer';
import Renderer from '../../../src/renderer';
import Example from './component/example';

domLayer.events.init();

var renderer = new Renderer();

var components = renderer.components();
components.register('example', Example);

renderer.mount('[router-viewport="index"]', 'example');
