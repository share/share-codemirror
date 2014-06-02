# Share-CodeMirror [![Build Status](https://secure.travis-ci.org/share/share-codemirror.png)](http://travis-ci.org/share/share-codemirror) [![Dependencies](https://david-dm.org/share/share-codemirror.png)](https://david-dm.org/share/share-codemirror) [![devDependency Status](https://david-dm.org/share/share-codemirror/dev-status.png)](https://david-dm.org/share/share-codemirror#info=devDependencies)
CodeMirror bindings for ShareJS >= 0.7.x.

## Dependencies

You need [lodash](http://lodash.com/) loaded before this library.

## Usage

```javascript
var cm = CodeMirror.fromTextArea(elem);

var ctx = shareDoc.createContext();
shareDoc.attachCodeMirror(cm, ctx);
shareDoc.attachCodeMirrorCursor(cm, ctx);
```

That's it. You now have 2-way sync between your ShareJS and CodeMirror.

### Configuration

The `attachCodeMirrorCursor` takes an optional 3rd `options` argument where the
following options may be set:

* `inactiveTimeout` - how long the "name" part of a cursor is visible after inactivity
* `color` - the color of the cursor
* `selectionColor` - the color of text selection
* `textColor` - the color of the "name" text

These attributes can also be set on a per-user basis with presence properties:

```javascript
shareDoc.setPresenceProperty("name", name);
shareDoc.setPresenceProperty("color", color);
shareDoc.setPresenceProperty("selectionColor", selectionColor);
shareDoc.setPresenceProperty("textColor", textColor);
shareDoc.setPresenceProperty("inactiveTimeout", 10000);
```

Share-Codemirror will provide default values for all of these properties if you
don't set them explicitly. You may want to use a color library such as
[TinyColor](http://bgrins.github.io/TinyColor/)
to manipulate colors, for example setting `selectionColor` a bit brighter than
`color`, or finding a legible `textColor` based on `color`.

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
npm test
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
