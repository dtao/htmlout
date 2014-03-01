var jsdom = require('jsdom').jsdom,
    nearestColor = require('nearest-color');

var supportedColors = {
  red: '#f00',
  yellow: '#ff0',
  blue: '#00f',
  green: '#0f0'
};

var colorSequences = {
  red: ['\x1B[31m', '\x1B[39m'],
  yellow: ['\x1B[33m', '\x1B[39m'],
  blue: ['\x1B[34m', '\x1B[39m'],
  green: ['\x1B[32m', '\x1B[39m']
};

var bgColorSequences = {
  red: ['\x1B[41m', '\x1B[49m'],
  yellow: ['\x1B[43m', '\x1B[49m'],
  blue: ['\x1B[44m', '\x1B[49m'],
  green: ['\x1B[42m', '\x1B[49m']
};

var styleSequences = {
  bold: ['\x1B[1m',  '\x1B[22m'],
  italic: ['\x1B[3m',  '\x1B[23m'],
  underline: ['\x1B[4m', '\x1B[24m'],
};

/**
 * @example
 * constyle('<span style="color: #f24;">Hello</span>, <span style="color: #4f4;">world</span>!');
 * // => '\x1B[31mHello\x1B[39m, \x1B[32mworld\x1B[39m!'
 *
 * constyle('<span style="text-decoration: underline;">foo</span>');
 * // => '\x1B[4mfoo\x1B[24m'
 *
 * constyle('<html><style>.yellow { color: #ffe; }</style><span class="yellow">foo</span></html>');
 * // => '\x1B[33mfoo\x1B[39m'
 */
function constyle(html) {
  var doc = jsdom(html),
      win = doc.parentWindow;

  var buffer = [];
  forEach(doc.childNodes, function(node) {
    output(node, win, buffer);
  });

  return buffer.join('');
}

function output(node, win, buffer) {
  if (node.nodeName === 'STYLE' || node.nodeName === 'SCRIPT') {
    return;
  }

  if (hasChildren(node)) {
    forEach(node.childNodes, function(child) {
      output(child, win, buffer);
    });
    return;
  }

  switch (node.nodeType) {
    case 1: // element
      buffer.push(applyStyle(node, win));
      break;

    case 3: // text node
      buffer.push(node.textContent);
      break;
  }
}

function hasChildren(node) {
  return node.childNodes.length > 1 ||
    (node.childNodes.length === 1 && node.childNodes[0].nodeType !== 3);
}

function applyStyle(node, win) {
  var text = node.textContent;

  var style = win.getComputedStyle(node);
  if (style.color) {
    var color = nearestColor(style.color, supportedColors);
    var sequence = colorSequences[color.name];
    text = sequence[0] + text + sequence[1];
  }

  if (style.backgroundColor) {
    var bgColor = nearestColor(style.backgroundColor, supportedColors);
    var sequence = bgColorSequences[bgColor.name];
    text = sequence[0] + text + sequence[1];
  }

  if (style.fontStyle === 'italic') {
    text = styleSequences.italic[0] + text + styleSequences.italic[1];
  }

  if (style.fontWeight === 'bold') {
    text = styleSequences.bold[0] + text + styleSequences.bold[1];
  }

  if (style.textDecoration === 'underline') {
    text = styleSequences.underline[0] + text + styleSequences.underline[1];
  }

  return text;
}

function forEach(collection, fn) {
  Array.prototype.forEach.call(collection, fn);
}

module.exports = constyle;
