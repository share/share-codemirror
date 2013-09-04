# Share-CodeMirror [![Build Status](https://secure.travis-ci.org/share/share-codemirror.png)](http://travis-ci.org/share/share-codemirror) [![Dependencies](https://david-dm.org/share/share-codemirror.png)](https://david-dm.org/share/share-codemirror)

CodeMirror bindings for ShareJS >= 0.7.x.

## Usage

```javascript
var cm = CodeMirror.fromTextArea(elem);
var ctx = shareDoc.createContext();

// Hook them up
doc.attachCodeMirror(cm);
```

## Install with Bower

```
bower install share-codemirror
```

## Install with NPM

```
npm install share-codemirror
```

And mount as a static resource

```javascript
var shareCodeMirror = require('share-codemirror');
// This example uses express.
app.use(express.static(shareCodeMirror.scriptsDir));
```

In the HTML:

```html
<script src="/share-codemirror.js"></script>
```

## Try it out

```
npm install
node examples/server.js
# in a couple of browsers...
open http://localhost:7007
```

## Run tests

```
npm install
npm test
```

## Release process

Modify version in `bower.json`, then run:

```
npm version `jq -r < bower.json .version`
```
