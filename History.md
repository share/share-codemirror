## [0.1.0](https://github.com/share/share-codemirror/compare/v0.0.5...v0.1.0) (26 Nov 2014)

* Augment CodeMirror instance with `detachShareJsDoc()`. In a single app context, CodeMirror instances might be attached several times to the same shared doc. This can lead to multiple share channels attached to multiple ghost instances of CodeMirror for the same file, causing an infinite loop while the editors keep appending content to the file. This new method allows for safely disconnecting a shareJs doc from a CodeMirror instance.

## [0.0.5](https://github.com/share/share-codemirror/compare/v0.0.4...v0.0.5) (12 Nov 2013)

* Handle empty documents. This is a workaround for a sharejs bug where `ctx.get()` returns `undefined`.

## [0.0.4](https://github.com/share/share-codemirror/compare/v0.0.3...v0.0.4) (3 Nov 2013)

* Fix npm install problem. [#2](https://github.com/share/share-codemirror/issues/2).

## [0.0.3](https://github.com/share/share-codemirror/compare/v0.0.2...v0.0.3) (28 Sept 2013)

* Use `ctx.get()` instead of deprecated `ctx.getText()`.
* Added code coverage.
* Wrote more tests.

## 0.0.2 (2013-09-04)

First release! Based on the ShareJS 0.6 CodeMirror bindings by Thaddée Tyl, J.D. Zamfirescu
and luto. Aslak Hellesøy ported the code from CoffeeScript to JavaScript, adapted to the
ShareJS 0.7 API and added tests.
