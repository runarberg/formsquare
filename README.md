[![npm](https://img.shields.io/npm/v/formsquare.svg)](https://www.npmjs.com/package/formsquare)
[![Build Status](https://travis-ci.org/runarberg/formsquare.svg?branch=master)](https://travis-ci.org/runarberg/formsquare)

formsquare
==========

> Turn your HTML5 forms into javascript objects the smart way.

### Installation

```
npm install --save formsquare
```

### Usage

```
formsquare(form: HTMLFormElement[, filter: (Node -> Boolean)]) -> Null|Boolean|Number|String|Array|Object
formsquare(filter: (Node -> Boolean)) -> (form: HTMLFormElement) -> Null|Boolean|Number|String|Array|Object
```

What makes formsquare different
-------------------------------

Formsquare is yet another [square bracket notation][1] form to
javascript object serializer, but smarter. Formsquare tries
to be smart about your form structure and keep open most possible
mappings to valid JSON objects.

For the first part formsquare tries to retain the types of your form
elements.

* Inputs of type `checkbox` with no explicit value attribute get the
  value `true` if it is checked, and `false` otherwise.
* Inputs of type `number` and `range` gets it value casted to `number`.
* All other elements get their value as `string`.

Secondly formsquare won’t force you into a root object.

* Form elements with explicit `name` attribute will nest inside an
  object.
* Form elements with a `name` starting with `[]` will nest inside an
  array.
* Form elements without an explicit `name` will either be a single
  value (if it is the only element of the form) or an array.

And finally formsquare tries retain the meaning of your checkboxes.

* A single valued checkbox will be that value if checked, otherwise it
  will be `null`.
* A collection (2 or more) of valued checkboxes, sharing the name,
  will collect all checked values into an array.
* Explicit array checkboxes will always be collected in an array if
  checked.

This means that you’ll now have more flexeble options in structuring
your HTML forms. If your form only takes a single number, just leave
an unamed input of type `number`.

Examples
--------

### Basic usage

```html
<form id="my-form">
  <input name="foo" value="bar">
  <input name="baz" value="quux" disabled>
</form>
```

```js
var formsquare = require("formsquare");

var form = document.getElementById("my-form");
var filter = (el) => !el.disabled;

formsquare(form, filter);
// {"foo": "bar"}
```

### Currying

You can pass only a predicate function to formsquare and be returned
with a new serializer that will filter all form elements by that
predicate.

```html
<form>
  <input value="foo">
  <input value="bar" disabled>
</form>

<form>
  <input value="foo" disabled>
  <input value="bar">
</form>
```

```js
var formsquare = require("formsquare");
var serialize = formsquare((el) => !el.disabled);

serialize(document.forms[0]);
// "foo"

serialize(document.forms[1]);
// "bar"
```

### Simple forms

An empty form will always return `null`

```html
<form id="empty-form"></form>
```

```js
formsquare(document.getElementById("empty-form"));
// null
```

A form with a single element without an explicit name gives you a
singleton value.

```html
<form id="singleton-form">
  <input type="number" value="42">
</form>
```

```js
var singletonForm = document.getElementById("singleton-form");
formsquare(singletonForm);
// 42

singletonForm[0].type = "text";
formsquare(singletonForm);
// "42"
```

### Checkboxes

If your form needs a list of booleans, you only need to omit the value
attribute:

```html
<form id="checkbox-form">
  <input type="checkbox" name="[]">
  <input type="checkbox" name="[]" checked>
</form>
```

```js
var checkboxForm = document.getElementById("checkbox-form");
formsquare(checkboxForm);
// [false, true]
```

Checkboxes with explicit values are handled differently:

```js
checkboxForm[0].value = "false";
checkboxForm[1].value = "on";

formsquare(checkboxForm);
// ["on"]
```

And if no checkbox is checked, you will get the empty array:

```js
checkboxForm[1].checked = false;

formsquare(checkboxForm);
// []
```

Alternatives
------------

If you want a more traditional form serializer, you could take a look
at any of these:

* [form2js](https://www.npmjs.com/package/form2js)
* [form-parse](https://www.npmjs.com/package/form-parse)
* [form-serialize](https://www.npmjs.com/package/form-serialize)
* [form-serializer](https://www.npmjs.com/package/form-serializer)
* [get-form-data](https://www.npmjs.com/package/get-form-data)

[1]: https://www.w3.org/TR/html-json-forms/
