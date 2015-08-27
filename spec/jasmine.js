var jsdom = require('jsdom');
require('source-map-support').install();
require('babel-core/register');

global.document = jsdom.jsdom();
global.window = global.document.parentWindow;

require('./support/custom-matchers')
require('./util/path-spec');
require('./transpiler-spec');
require('./component-spec');

