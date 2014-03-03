# htmlout

HTML-styled console output.

## Example

Say you have this string in a variable called `html`:

```html
<html>
  <style>
    strong { font-weight: bold; }
    strike { text-decoration: strikethrough; }
    u { text-decoration: underline; }
  </style>

  <p>
    <span style="color: #0f0">Hello!</span> <strong>This text should be bold.</strong>
    And then <strike>here we have struck-out text</strike>, <u>underlined text</u>, etc.
  </p>
</html>
```

Now we pass that to `htmlout`:

```javascript
console.log(htmlout(html));
```

Output:

![Console output](http://i.imgur.com/cqBE08b.png)
