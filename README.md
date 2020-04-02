[![npm](https://img.shields.io/npm/v/formsquare.svg)](https://www.npmjs.com/package/formsquare)
[![Build Status](https://travis-ci.org/runarberg/formsquare.svg?branch=master)](https://travis-ci.org/runarberg/formsquare)
[![Coverage Status](https://coveralls.io/repos/github/runarberg/formsquare/badge.svg)](https://coveralls.io/github/runarberg/formsquare)

formsquare
==========

> Turn your HTML5 forms into javascript objects the smart way.

### Installation

```
npm install --save formsquare
```

### Usage

#### Module

```js
import formsquare from "formsquare";

formsquare.parse(form);

// or
formsquare.filter(myFilter).parse(form);
```

Where `form` is an `HTMLFormElement` (like `document.forms[0]`) and
`myFilter` is a predicate function (like `el => !el.disabled`) that
determines which form elements to include.

#### commonjs

Same as above except import with:

```js
const formsquare = require("formsquare");
```

#### HTML

Download the [full script][full-script] or [minified script][min-script]
and include this in your HTML file:

```html
<script src="formsquare.js"></script>
<script>
  // use `formsquare` below.
</script>
```

Or download the [module][full-module] and import it:

```html
<script module>
  import formsquare from "/path/to/module/formsquare.js";

  // Use `formsquare` below.
</script>
```

#### [More examples below](#examples)

What makes formsquare different
-------------------------------

Formsquare is yet another [square bracket notation][spec] form to
javascript object parser, but smarter. Formsquare tries to be smart
about your form structure and keep open most possible mappings to
valid JSON objects. Formsquare will also take note of your HTML5 [form
attributes][mdn/input#attr-form], even in [Internet
Explorer][caniuse#form-attribute].

For the first part formsquare tries to retain the types of your form
elements.

* Inputs of type `checkbox` with no explicit value attribute get the
  value `true` if it is checked, and `false` otherwise.
* Inputs of type `number` and `range` gets it value casted to `number`.
* Inputs of type `month`, `week`, `date`, and `datetime-local` will
  get their values as a `Date` object. Invalid dates, retain their
  original values.
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
import formsquare from "formsquare";

const form = document.getElementById("my-form");
const filter = el => !el.disabled;

formsquare.filter(filter).parse(form);
//=> {"foo": "bar"}
```

### Filters

You can call `formsquare.filter` with a predicate be returned a new
parser that will filter all form elements by that predicate.

```html
<form>
  <input value="foo">
  <input value="bar" disabled>
</form>

<form>
  <input value="foo" disabled>
  <input value="bar">
</form>

<form>
  <input value="foo" disabled>
  <input value="bar" class="hidden">
  <input value="baz">
</form>
```

```js
import formsquare from "formsquare";

const { parse } = formsquare.filter(el => !el.disabled);

parse(document.forms[0]);
//=> "foo"

parse(document.forms[1]);
//=> "bar"

// Filters can be chained

formsquare
  .filter(el => !el.disabled)
  .filter(el => !el.classList.contains("hidden"))
  .parse(document.forms[2]);
//=> "baz"
```

### Simple forms

An empty form will always return `null`

```html
<form id="empty-form"></form>
```

```js
formsquare.parse(document.getElementById("empty-form"));
//=> null
```

A form with a single element without an explicit name gives you a
singleton value.

```html
<form id="singleton-form">
  <input type="number" value="42">
</form>
```

```js
const singletonForm = document.getElementById("singleton-form");
formsquare.parse(singletonForm);
//=> 42

singletonForm[0].type = "text";
formsquare.parse(singletonForm);
//=> "42"
```

### Collections of forms

You can pass in an array or a [node list][mdn#node-list] of forms and
it will be handled as a single form.

```html
<form>
  <input type="number" name="foo" value="2">
  <input type="number" name="bar" value="5">
</form>

<form>
  <input type="number" name="foo" value="42">
</form>
```

```js
formsquare.parse(document.forms);
//=> {"foo": [2, 42], "bar": 5}

[...document.forms].map(formsquare.parse);
//=> [{"foo": 2, "bar": 5}, {"foo": 42}]
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
const checkboxForm = document.getElementById("checkbox-form");
formsquare.parse(checkboxForm);
//=> [false, true]
```

Checkboxes with explicit values are handled differently:

```js
checkboxForm[0].value = "false";
checkboxForm[1].value = "on";

formsquare.parse(checkboxForm);
//=> ["on"]
```

And if no checkbox is checked, you will get the empty array:

```js
checkboxForm[1].checked = false;

formsquare.parse(checkboxForm);
//=> []
```

### Files

Inputs with the type of “file” (`<input type="file">`) result in a
promise containing the file object. File inputs with `multiple` set to
true will result in promise of an array of such objects.

```html
<form>
  <input type="file">
</form>
```

Granted that a user uploaded the file `foo.txt` conatining the text
`foo`:

```js
await formsquare.parse(document.forms[0]);

//=> {
//     body: "Zm9v",
//     name: "foo.txt",
//     type: "text/plain",
//   }
```

Alternatives
------------

If you want a more traditional form parser, you could take a look at
any of these:

* [form2js](https://www.npmjs.com/package/form2js)
* [form-parse](https://www.npmjs.com/package/form-parse)
* [form-serialize](https://www.npmjs.com/package/form-serialize)
* [form-serializer](https://www.npmjs.com/package/form-serializer)
* [get-form-data](https://www.npmjs.com/package/get-form-data)

[full-code]: https://raw.githubusercontent.com/runarberg/formsquare/dist/dist/formsquare.js
[minified-code]: https://raw.githubusercontent.com/runarberg/formsquare/dist/dist/formsquare.min.js

[caniuse#form-attribute]: http://caniuse.com/#feat=form-attribute
[mdn/input#attr-form]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-form
[mdn/node-list]: https://developer.mozilla.org/en-US/docs/Web/API/NodeList
[spec]: https://www.w3.org/TR/html-json-forms/
