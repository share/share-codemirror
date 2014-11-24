# Share-CodeMirror [![Build Status](https://secure.travis-ci.org/share/share-codemirror.png)](http://travis-ci.org/share/share-codemirror) [![Dependencies](https://david-dm.org/share/share-codemirror.png)](https://david-dm.org/share/share-codemirror) [![devDependency Status](https://david-dm.org/share/share-codemirror/dev-status.png)](https://david-dm.org/share/share-codemirror#info=devDependencies)
CodeMirror bindings for ShareJS >= 0.7.x.

## Usage

```javascript
var cm = CodeMirror.fromTextArea(elem);
shareDoc.attachCodeMirror(cm);
```

That's it. You now have 2-way sync between your ShareJS and CodeMirror.

## Install with Bower

```
bower install share-codemirror
```

## Install with NPM

```
npm install share-codemirror
```

On Node.js you can mount the `scriptsDir` (where `share-codemirror.js` lives) as a static resource
in your web server:

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

Try clicking the infinite monkeys button. Do it in both browsers.
Wait for poetry to appear.

## Run tests

```
npm install
npm test
```

With test coverage:

```
node_modules/.bin/istanbul cover node_modules/.bin/_mocha -- -u exports
open coverage/lcov-report/index.html
```

## Release process

```
npm outdated --depth 0 # See if you can upgrade something
```

* Modify version in `bower.json` (not in `package.json`)
* Update `History.md`
* Commit

Then run:

```
npm version `jq -r < bower.json .version`
npm publish
git push --tags
```

There is no `bower publish` - the existance of a git tag is enough.
