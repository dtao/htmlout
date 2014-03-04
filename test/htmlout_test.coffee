require 'should'

htmlout = require('../htmlout')

describe 'htmlout', ->
  it 'reads style attributes directly', ->
    htmlout('<span style="color: #f00;">foo</span>').should.eql(
      '\x1B[91mfoo\x1B[39m'
    )

  it 'applies parent styling to text nodes', ->
    html =
      '<div style="color: #00f;">' +
        '<span style="color: #0f0;">Hello</span>' +
        ' there, ' +
        '<span style="color: #f00;">world!</span>' +
      '</div>'
    htmlout(html).should.eql(
      '\x1B[92mHello\x1B[39m\x1B[34m there, \x1B[39m\x1B[91mworld!\x1B[39m'
    )

  it 'understands stylesheets', ->
    css =
      '''
      .highlight { color: #ff0; }
      '''
    htmlout.withCSS(css)('<span class="highlight">blah</span>').should.eql(
      '\x1B[93mblah\x1B[39m'
    )
