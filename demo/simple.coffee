htmlout = require('../htmlout')

html =
  '''
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
  '''

console.log('HTML:')
console.log(html + '\n')

console.log('Styled:')
console.log(htmlout(html))
