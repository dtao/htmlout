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

var defaultStylesheet =
  'p, div { display: block; }\n' +
  'b, strong { font-weight: bold; }\n' +
  'i, em { font-style: italic; }\n' +
  'u { text-decoration: underline; }\n' +
  'del, strike { text-decoration: strikethrough; }\n' +
  'pre { white-space: pre; }';

var fs = require('fs'),
    path = require('path'),
    jsdom = require('jsdom').jsdom;

var extendedColorsFile = path.join(__dirname, 'data', 'extendedColors.json'),
    extendedColors = JSON.parse(fs.readFileSync(extendedColorsFile, 'utf8')),
    nearestColor = require('nearest-color').from(supportedColors).or(invert(extendedColors));

/**
 * @example
 * htmlout('<span style="color: #f24;">Hello</span>, <span style="color: #4f4;">world</span>!');
 * // => '\x1B[91mHello\x1B[39m, \x1B[92mworld\x1B[39m!'
 *
 * htmlout('<span style="text-decoration: underline;">foo</span>');
 * // => '\x1B[4mfoo\x1B[24m'
 *
 * htmlout('<html><style>.yellow { color: #ff4; }</style><span class="yellow">foo</span></html>');
 * // => '\x1B[93mfoo\x1B[39m'
 */
function htmlout(html, options) {
  var doc = jsdom('<html><head></head><body></body></html>'),
      win = doc.parentWindow;

  options || (options = {});
  options.css || (options.css = []);

  options.css.unshift(defaultStylesheet);
  options.css.forEach(function(css) {
    var styleNode = doc.createElement('STYLE');
    styleNode.textContent = css;
    doc.head.appendChild(styleNode);
  });

  doc.body.innerHTML = html;

  var buffer = [];
  forEach(doc.body.childNodes, function(node) {
    output(node, win, buffer);
  });

  return buffer.join('');
}

htmlout.withCSS = function withCSS(css) {
  var htmloutBase = htmlout;

  var result = function htmlout(html, options) {
    options || (options = {});
    options.css || (options.css = []);
    options.css.push(css);

    return htmloutBase(html, options);
  };

  for (var prop in htmloutBase) {
    result[prop] = htmloutBase[prop];
  }

  return result;
};

function output(node, win, buffer) {
  if (node.nodeName === 'STYLE' || node.nodeName === 'SCRIPT') {
    return;
  }

  var style = getStyle(node, win);

  if (hasChildren(node)) {
    forEach(node.childNodes, function(child) {
      output(child, win, buffer);
    });

  } else if (isTextNode(node)) {
    buffer.push(applyStyle(node, style, win));
  }

  if (isElement(node.previousSibling)) {
    ensureLineBreakAfterBlock(buffer, getStyle(node.previousSibling, win));
  }
}

function hasChildren(node) {
  return node.childNodes.length > 0;
}

function applyStyle(textNode, style, win) {
  var text = textNode.textContent;

  if (findStyle(textNode, 'whiteSpace', win) !== 'pre') {
    text = text.replace(/\s+/g, ' ');

    if (isFirstChild(textNode)) {
      text = text.replace(/^\s/, '');
    }
    if (isLastChild(textNode)) {
      text = text.replace(/\s$/, '');
    }
  }

  if (style.color) {
    var color = nearestColor(style.color);
    if (color) {
      var sequence = getColorSequence(color.name);
      text = applySequence(text, sequence);
    }
  }

  if (style.backgroundColor) {
    var bgColor = nearestColor(style.backgroundColor);
    if (bgColor) {
      var bgSequence = bgColorSequences[bgColor.name];
      text = applySequence(text, bgSequence);
    }
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

/**
 * This is VERY stupid and deserves refactoring in the near future. Basically,
 * I structured colors and extendedColors differently; so if this is the name of
 * a color, then it's a "standard" color, but if it's a number, then it denotes
 * an extended color.
 *
 * Really I should change the API of nearest-color so that you can associate
 * arbitrary data w/ a color. That way I wouldn't need to do the color-name-to-
 * sequence mapping.
 */
function getColorSequence(name) {
  var sequence = colorSequences[name];

  if (!sequence) {
    sequence = ['\x1B[38;5;' + name + 'm', '\x1B[39m'];
  }

  return sequence;
}

function applySequence(text, sequence) {
  return sequence[0] + text + sequence[1];
}

function isElement(node) {
  return node && node.nodeType === 1;
}

function isTextNode(node) {
  return node && node.nodeType === 3;
}

function getStyle(node, win) {
  if (isTextNode(node)) {
    node = node.parentNode;
  }

  return isElement(node) ? win.getComputedStyle(node) : {};
}

function findStyle(node, property, win) {
  if (isTextNode(node)) {
    node = node.parentNode;
  }

  var style = win.getComputedStyle(node);
  while (!style[property]) {
    node = node.parentNode;
    if (!isElement(node)) {
      break;
    }

    style = win.getComputedStyle(node);
  }

  return style[property];
}

function isFirstChild(textNode) {
  return (textNode === textNode.parentNode.firstChild) &&
    (textNode.parentNode === textNode.parentNode.parentNode.firstChild);
}

function isLastChild(textNode) {
  return (textNode === textNode.parentNode.lastChild) &&
    (textNode.parentNode === textNode.parentNode.parentNode.lastChild);
}

/**
 * Appends a new line to the buffer under all of the following conditions:
 *
 * 1. The last string pushed to the buffer wasn't already a newline
 * 2. The buffer isn't empty (no need for a line break before the first line)
 * 3. The previous sibling was a block-level element
 *
 * @param {Array.<string>} buffer
 */
function ensureLineBreakAfterBlock(buffer, style) {
  if (buffer.length > 0 && (buffer[buffer.length - 1] !== '\n')) {
    if (style.display === 'block') {
      buffer.push('\n');
    }
  }
}

function forEach(collection, fn) {
  Array.prototype.forEach.call(collection, fn);
}

/**
 * This method exists because I was dumb and made extendedColors.json backwards.
 */
function invert(object) {
  var inverted = {};
  for (var prop in object) {
    inverted[object[prop]] = prop;
  }
  return inverted;
}

module.exports = htmlout;
