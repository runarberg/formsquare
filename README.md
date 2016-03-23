[![npm](https://img.shields.io/npm/v/formsquare.svg)](https://www.npmjs.com/package/formsquare)
[![Build Status](https://travis-ci.org/runarberg/formsquare.svg?branch=master)](https://travis-ci.org/runarberg/formsquare)

formsquare
==========

Turn your HTML5 forms into javascript objects the smart way.

Formsquare is yet another [square bracket notation][1] form
serializer, but weirder. What mainly sets formsquare appart from the
other serializers out there is that formsquare tries to be smart about
your form structure and keep open most possible mappings to valid JSON
objects.

The first round of wierdness comes with trying to retain the types of
your form elements.

* Inputs of type `checkbox` with no explicit value attribute get the
  value `true` if it is checked, and `false` otherwise.
* Inputs of type `number` and `range` gets it value casted to `number`.
* All other elements get their value as `string`.

And second round is even wierder by doing away with the traditional
root object:

* Form elements with explicit `name` attribute will nest inside an
  object.
* Form elements with a `name` starting with `[]` will nest inside an
  array.
* Form elements without an explicit `name` will either be a single
  value (if it is the only element of the form) or an array.

And if you though this couldn't get any wierder, you should see what
formsquare does with your valued checkboxes.

* A single valued checkbox will be that value if checked, otherwise it
  will be `null`.
* A collection (2 or more) of valued checkboxes, sharing the name,
  will collect all checked values into an array.
* Explicit array checkboxes will always be collected in an array if
  checked.

This means that you’ll now have more flexeble options in structuring
your HTML forms. If your form only takes a single number, just leave
an unamed input of type `number`:

```html
<form id="numeric-form">
  <input type="number" value="42">
</form>
```

```js
let form = document.getElementById("numeric-form");
console.log(formsquare(form));
// 42

form[0].type = "text";
console.log(formsquare(form));
// "42"
```

Or if your form needs a list of booleans, you only need to omit the
value attribute:

```html
<form id="booleans-form">
  <input type="checkbox" name="[]">
  <input type="checkbox" name="[]" checked>
  <input type="checkbox" name="[]" value="true" checked>
</form>
```

```js
let form = document.getElementById("booleans-form");
console.log(formsquare(form));
// [false, true, "true"]
```

### Alternatives

If you want a more traditional form serializer, you could take a look
at any of these:

* [form2js](https://www.npmjs.com/package/form2js)
* [form-parse](https://www.npmjs.com/package/form-parse)
* [form-serialize](https://www.npmjs.com/package/form-serialize)
* [form-serializer](https://www.npmjs.com/package/form-serializer)
* [get-form-data](https://www.npmjs.com/package/get-form-data)

[1]: https://www.w3.org/TR/html-json-forms/
