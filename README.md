# htmlout

This library lets you use (a very restricted subset of) HTML to style console output.

## Example

Say you have this string in a variable called `html`:

```html
<p><span style="color: #0f0">Hello!</span> <strong>This text should be bold.</strong></p>
<p>And then <strike>here we have struck-out text</strike>, <u>underlined text</u>, etc.</p>
```

Now we pass that to `htmlout`:

```javascript
console.log(htmlout(html));
```

Output:

![Console output](http://i.imgur.com/cqBE08b.png)

You can even apply stylesheets. For instance, suppose you have the following CSS in a variable
called `css`:

```css
.info {
  color: blue;
}

.success {
  color: lime;
  text-decoration: underline;
}

.warning {
  color: orange;
  font-weight: bold;
}

.fail {
  color: red;
  background-color: yellow;
  font-weight: bold;
}
```

And then this is `html`:

```html
<p class="info">Here is some information.</p>
<p class="success">The mission was a success!</p>
<p class="warning">You are running low on fuel.</p>
<p class="fail">System failure!</p>
```

Then you use `htmlout.withCSS`:

```javascript
var withStylesheet = htmlout.withCSS(css);
console.log(withStylesheet(html));
```

Output:

![Console output](http://i.imgur.com/UwdktNB.png)

This project is used by [console-highlight](https://github.com/dtao/console-highlight) to do syntax
highlighting in the console. Here's an example:

![Example output from console-highlight](http://i.imgur.com/MAu1uZJ.png)

## Supported CSS Styles

Obviously (well, at least without herculean effort), it isn't possible to support all CSS styles
from a console. These are the styles that *are* at least partially supported:

- `color`
- `background-color`
- `font-style` (`normal` or `italic` *on some terminals*)
- `font-weight` (`normal` or `bold`)
- `text-decoration` (`none`, `underline`, `strikethrough` *on some terminals*)
- `text-transform` (`none`, `uppercase`, `lowercase`, or `capitalize`)

## How it works

htmlout follows a relatively simple process:

1. First, the HTML is parsed using [jsdom](https://github.com/tmpvar/jsdom), which provides a DOM
   and handles stylesheets.
2. htmlout then iterates over every text node of the DOM, translating the relevant CSS style rules
   to terminal escape sequences. For example the CSS rule `font-weight: bold;` is translated to the
   escape sequence `'\x1B[1m'` and `'\x1B[21m'`.
3. The console does not support just any arbitrary color. htmlout uses
   [nearest-color](https://github.com/dtao/nearest-color) to make a best effort to translate any
   color in CSS to a valid escape sequence. This actually yields very good results, especially on
   terminals that support 256 colors. (This isn't 100% implemented yet. Colors in hex or RGB format
   should work; but for short names like 'aqua', only the 16 basic colors are supported right now.
   HSL format isn't supported at all.)

That's about it! If you have questions or run into issues,
[let me know](https://github.com/dtao/htmlout/issues)!
