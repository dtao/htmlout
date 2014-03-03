var supportedColors = {
  white: '#fff',
  black: '#000',
  red: '#cd0000',
  green: '#00cd00',
  yellow: '#cdcd00',
  blue: '#1e90ff',
  magenta: '#cd00cd',
  cyan: '#00cdcd',
  lightGrey: '#e5e5e5',
  darkGrey: '#4c4c4c',
  lightRed: '#f00',
  lightGreen: '#0f0',
  lightYellow: '#ff0',
  lightBlue: '#4682b4',
  lightMagenta: '#f0f',
  lightCyan: '#0ff'
};

var colorSequences = {
  white: ['\x1B[39m', '\x1B[39m'],
  black: ['\x1B[30m', '\x1B[39m'],
  red: ['\x1B[31m', '\x1B[39m'],
  green: ['\x1B[32m', '\x1B[39m'],
  yellow: ['\x1B[33m', '\x1B[39m'],
  blue: ['\x1B[34m', '\x1B[39m'],
  magenta: ['\x1B[35m', '\x1B[39m'],
  cyan: ['\x1B[36m', '\x1B[39m'],
  lightGrey: ['\x1B[37m', '\x1B[39m'],
  darkGrey: ['\x1B[90m', '\x1B[39m'],
  lightRed: ['\x1B[91m', '\x1B[39m'],
  lightGreen: ['\x1B[92m', '\x1B[39m'],
  lightYellow: ['\x1B[93m', '\x1B[39m'],
  lightBlue: ['\x1B[94m', '\x1B[39m'],
  lightMagenta: ['\x1B[95m', '\x1B[39m'],
  lightCyan: ['\x1B[96m', '\x1B[39m']
};

var bgColorSequences = {
  white: ['\x1B[107m', '\x1B[49m'],
  black: ['\x1B[40m', '\x1B[49m'],
  red: ['\x1B[41m', '\x1B[49m'],
  green: ['\x1B[42m', '\x1B[49m'],
  yellow: ['\x1B[43m', '\x1B[49m'],
  blue: ['\x1B[44m', '\x1B[49m'],
  magenta: ['\x1B[45m', '\x1B[49m'],
  cyan: ['\x1B[46m', '\x1B[49m'],
  lightGrey: ['\x1B[47m', '\x1B[49m'],
  darkGrey: ['\x1B[100m', '\x1B[49m'],
  lightRed: ['\x1B[101m', '\x1B[49m'],
  lightGreen: ['\x1B[102m', '\x1B[49m'],
  lightYellow: ['\x1B[103m', '\x1B[49m'],
  lightBlue: ['\x1B[104m', '\x1B[49m'],
  lightMagenta: ['\x1B[105m', '\x1B[49m'],
  lightCyan: ['\x1B[106m', '\x1B[49m']
};

var styleSequences = {
  bold: ['\x1B[1m',  '\x1B[22m'],
  italic: ['\x1B[3m',  '\x1B[23m'],
  underline: ['\x1B[4m', '\x1B[24m'],
  strikethrough: ['\x1B[9m',  '\x1B[29m']
};

var jsdom = require('jsdom').jsdom,
    nearestColor = require('nearest-color').from(supportedColors);

/**
 * @example
 * htmlout('<span style="color: #f24;">Hello</span>, <span style="color: #4f4;">world</span>!');
 * // => '\x1B[31mHello\x1B[39m, \x1B[32mworld\x1B[39m!'
 *
 * htmlout('<span style="text-decoration: underline;">foo</span>');
 * // => '\x1B[4mfoo\x1B[24m'
 *
 * htmlout('<html><style>.yellow { color: #ff4; }</style><span class="yellow">foo</span></html>');
 * // => '\x1B[33mfoo\x1B[39m'
 */
function htmlout(html) {
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
    var color = nearestColor(style.color);
    var sequence = colorSequences[color.name];
    text = applySequence(text, sequence);
  }

  if (style.backgroundColor) {
    var bgColor = nearestColor(style.backgroundColor);
    var bgSequence = bgColorSequences[bgColor.name];
    text = applySequence(text, bgSequence);
  }

  if (style.fontStyle === 'italic') {
    text = applySequence(text, styleSequences.italic);
  }

  if (style.fontWeight === 'bold') {
    text = applySequence(text, styleSequences.bold);
  }

  if (style.textDecoration === 'underline') {
    text = applySequence(text, styleSequences.underline);
  } else if (style.textDecoration === 'strikethrough') {
    text = applySequence(text, styleSequences.strikethrough);
  }

  return text;
}

function applySequence(text, sequence) {
  return sequence[0] + text + sequence[1];
}

function forEach(collection, fn) {
  Array.prototype.forEach.call(collection, fn);
}

module.exports = htmlout;
