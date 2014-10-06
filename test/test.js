var assert = require('assert');
var bml = require('../');

var eq = function (source, html) {
  return assert.equal(bml(source), html);
};

describe('bml', function () {
  it('should make links', function () {
    eq('<http://example.org example>', '<a href="http://example.org">example</a>');
    eq('</foo bar baz>', '<a href="/foo">bar baz</a>');
    eq('<foo *bar* baz>', '<a href="foo"><em>bar</em> baz</a>');
    eq('<foo bar <another link?> baz>', '<a href="foo">bar &lt;another link?</a> baz>');
    eq('<foo>', '<a href="foo" class="tag">foo</a>');
  });

  it('should emphasis text', function () {
    eq('*foo*', '<em>foo</em>');
    eq('**foo**', '<em><em>foo</em></em>');
    eq('*foo*', '<em>foo</em>');

    eq('*fo\no*', '*fo\no*');
  });

  it('should perform SmartPants transformations', function () {
    eq('foo--bar', 'foo\u2014bar');
    eq('foo...bar', 'foo\u2026bar');
  });

  it('should escape HTML', function () {
    assert.notEqual(bml('<h1>foo</h1>'), '<h1>foo</h1>');
  });

  it('should be escapable', function () {
    eq('\\*foo*', '*foo*');
    eq('\\*foo\\*', '*foo*');
    eq('\\\\', '\\');
  });

  it('should display code', function () {
    eq('`foo`', '<code>foo</code>');
    eq('`foo *bar*`', '<code>foo *bar*</code>');
    eq('foo`bar`baz', 'foo<code>bar</code>baz');

    eq('```foo\nbar\nbaz```', '<pre>foo\nbar\nbaz</pre>');
  });

  it('should make lists', function () {
      eq('* foo', '* foo');
      eq('* foo\n* bar', '<ul><li>foo<li>bar</ul>');
      eq('* foo\n* bar *baz*', '<ul><li>foo<li>bar <em>baz</em></ul>');
      eq('* foo\n** bar\n* baz', '<ul><li>foo<ul><li>bar</ul><li>baz</ul>');
  });
})
