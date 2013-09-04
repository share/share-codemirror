# Share-CodeMirror [![Build Status](https://secure.travis-ci.org/share/share-codemirror.png)](http://travis-ci.org/share/share-codemirror) [![Dependencies](https://david-dm.org/share/share-codemirror.png)](https://david-dm.org/share/share-codemirror)

CodeMirror bindings for ShareJS >= 0.7.x.

## Usage

```javascript
var cm = CodeMirror.fromTextArea(elem);
var ctx = shareDoc.createContext();

// Hook them up
shareCodeMirror(cm, ctx);
```

## Example

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

## TODO

* Write more tests for deletion (which is buggy)
* Package as bower package

