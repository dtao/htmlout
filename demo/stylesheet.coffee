htmlout = require('../htmlout')

css =
  '''
  .info {
    color: blue;
    background-color: gray;
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
    font-style: italic;
    font-weight: bold;
  }
  '''

html =
  '''
  <p class="info">Here is some information.</p>
  <p class="success">The mission was a success!</p>
  <p class="warning">You are running low on fuel.</p>
  <p class="fail">System failure!</p>
  '''

console.log('CSS:')
console.log(css + '\n')

console.log('HTML:')
console.log(html + '\n')

console.log('Styled:')
console.log(htmlout.withCSS(css)(html))
