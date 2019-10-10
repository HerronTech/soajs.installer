**Note from maintainers: Nowadays you should use https://github.com/npm/node-which**

# node-whereis <sup>[![Version Badge][npm-version-svg]][package-url]</sup> [![Build Status][travis-svg]][travis-url] [![License][license-image]][license-url] [![Downloads][downloads-image]][downloads-url]

Simply get the first path to a bin on any system.

```js
var whereis = require('whereis');
whereis('wget', function(err, path) {
  console.log(path);
});
// /usr/bin/wget
```

[package-url]: https://npmjs.org/package/node-whereis
[npm-version-svg]: http://vb.teelaun.ch/vvo/node-whereis.svg
[travis-svg]: https://img.shields.io/travis/vvo/node-whereis/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/vvo/node-whereis
[license-image]: http://img.shields.io/npm/l/node-whereis.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/node-whereis.svg?style=flat-square
[downloads-url]: http://npm-stat.com/charts.html?package=node-whereis
