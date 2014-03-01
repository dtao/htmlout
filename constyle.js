var jsdom = require('jsdom').jsdom,
    nearestColor = require('nearest-color');

var supportedColors = {
  red: '#f00',
  yellow: '#ff0',
  blue: '#00f',
  green: '#0f0'
};

var escapeSequences = {
  red: ['\x1B[31m', '\x1B[39m'],
  yellow: ['\x1B[33m', '\x1B[39m'],
  blue: ['\x1B[34m', '\x1B[39m'],
  green: ['\x1B[32m', '\x1B[39m']
};

/**
 * @example
 * output('<span style="color: #f00;">Hello</span>, <span style="color: #0f0;">world</span>!');
 * // => '\x1B[31mHello\x1B[39m, \x1B[32mworld\x1B[39m!'
 */
function output(html) {
  var doc = jsdom(html);

  var buffer = '';
  forEach(doc.childNodes, function(node) {
    switch (node.nodeType) {
      case 1: // element
        buffer += applyStyle(node);
        break;

      case 3: // text node
        buffer += node.textContent;
        break;
    }
  });

  return buffer;
}

function applyStyle(node) {
  var text = node.textContent;

  if (node.style.color) {
    var color = nearestColor(node.style.color, supportedColors);
    var sequence = escapeSequences[color.name];
    text = sequence[0] + text + sequence[1];
  }

  return text;
}

function forEach(collection, fn) {
  Array.prototype.forEach.call(collection, fn);
}

module.exports = output;
