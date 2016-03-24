import * as pkg from "../index";
import formsquare from "../index";
import test from "tape";

const checked = true;
const disabled = true;
const selected = true;

test("Named exports", ({equal, ok, plan}) => {
  plan(4);

  equal(pkg.NAME, "formsquare", "Name");
  ok(pkg.VERSION.match(/\d+\.\d+\.\d+/), "Version");
  ok(typeof pkg.default === "function", "formsquare()");
  equal(pkg.formsquare, pkg.default, "Default");
});

test("Types", ({deepEqual, equal, plan}) => {
  plan(4);

  deepEqual(tform(), null, "null (empty form)");

  equal(
    tform([input({"type": "number", "value": 1})]),
    1,
    "Number"
  );

  equal(
    tform([input({"type": "checkbox", checked})]),
    true,
    "Boolean"
  );

  equal(
    tform([input({"type": "text", "value": "1"})]),
    "1",
    "String"
  );
});

test("Collection types", ({deepEqual, plan}) => {
  plan(2);

  deepEqual(
    tform([input({"name": "foo", "value": "bar"})]),
    {"foo": "bar"},
    "Object"
  );

  deepEqual(
    tform([input({"name": "[]", "value": "bar"})]),
    ["bar"],
    "Array"
  );
});

test("Arrays", ({deepEqual, plan}) => {
  plan(4);

  deepEqual(
    tform([
      input({"name": "[]", "value": "foo"}),
      input({"name": "[]", "value": "bar"}),
    ]),
    ["foo", "bar"],
    "Square brackets"
  );

  deepEqual(
    tform([
      input({"name": "", "value": "foo"}),
      input({"name": "", "value": "bar"}),
    ]),
    ["foo", "bar"],
    "Multiple no-named values"
  );


  deepEqual(
    tform([
      input({"name": "[1]", "value": "foo"}),
      input({"name": "[0]", "value": "bar"}),
    ]),
    ["bar", "foo"],
    "Enumerated"
  );

  deepEqual(
    tform([
      input({"name": "[2]", "value": "foo"}),
      input({"name": "[0]", "value": "bar"}),
    ]),
    ["bar", null, "foo"],
    "Sparse"
  );
});

test("Objects", ({deepEqual, plan}) => {
  plan(3);

  deepEqual(
    tform([input({"type": "number", "name": "foo", "value": 42})]),
    {"foo": 42},
    "Basic"
  );

  deepEqual(
    tform([input({"type": "number", "name": "foo[bar]", "value": 42})]),
    {"foo": {"bar": 42}},
    "Nested"
  );

  deepEqual(
    tform([
      input({"name": "[0][name]", "value": "foo"}),
      input({"type": "number", "name": "[0][value]", "value": "5"}),
      input({"name": "[1][name]", "value": "bar"}),
      input({"type": "number", "name": "[1][value]", "value": "42"}),
    ]),
    [{"name": "foo", "value": 5}, {"name": "bar", "value": 42}],
    "Arrays of objects"
  );
});

test("Form elements", ({deepEqual, equal, plan}) => {
  plan(6);

  let loremIpsum = "Lorem ipsum dolar sit amet";

  deepEqual(
    tform([
      input({"type": "radio", "name": "radio", "value": "1"}),
      input({"type": "radio", "name": "radio", "value": "2", checked}),
      input({"type": "radio", "name": "radio", "value": "3"}),
    ]),
    {"radio": "2"},
    "Input type radio"
  );

  equal(
    tform([select([
      option("foo"),
      option({selected}, "bar"),
      option("baz"),
    ])]),
    "bar",
    "Select by content"
  );

  deepEqual(
    tform([select({"name": "select"}, [
      option({"value": "1"}, [text("foo")]),
      option({"value": "2", selected}, [text("bar")]),
      option({"value": "3"}, [text("baz")]),
    ])]),
    {"select": "2"},
    "Select by value"
  );

  equal(
    tform([textarea(loremIpsum)]),
    loremIpsum,
    "Textarea"
  );

  deepEqual(
    tform([textarea({"name": "text"}, loremIpsum)]),
    {"text": loremIpsum},
    "Textarea with name"
  );

  let div = crel("div", [
    form({"id": "form-0"}, [
      checkbox({"name": "inside", checked}),
      input({"name": "both[0]", "value": "foo"}),
    ]),
    textarea({"form": "form-0", "name": "outside"}, loremIpsum),
    input({"form": "form-0", "name": "both[1]", "value": "bar"}),
  ]);

  document.documentElement.appendChild(div);

  deepEqual(
    formsquare(document.getElementById("form-0")),
    {"inside": true, "outside": loremIpsum, "both": ["foo", "bar"]},
    "Outside and inside forms"
  );

  document.documentElement.removeChild(div);
});

test("Checkboxes", ({deepEqual, equal, plan}) => {
  plan(8);

  equal(tform([checkbox()]), false, "Unchecked");
  equal(tform([checkbox({checked})]), true, "Checked");

  deepEqual(
    tform([checkbox({"name": "foo"})]),
    {"foo": false},
    "Name -- unchecked"
  );

  deepEqual(
    tform([checkbox({"name": "foo", checked})]),
    {"foo": true},
    "Name -- checked"
  );

  equal(
    tform([checkbox({"value": "bar"})]),
    null,
    "Value -- unchecked"
  );

  equal(
    tform([checkbox({"value": "bar", checked})]),
    "bar",
    "Value -- checked"
  );

  deepEqual(
    tform([checkbox({"name": "foo", "value": "bar"})]),
    {"foo": null},
    "Name + value -- unchecked"
  );

  deepEqual(
    tform([checkbox({"name": "foo", "value": "bar", checked})]),
    {"foo": "bar"},
    "Name + value -- checked"
  );
});

test("Checkbox arrays", ({deepEqual, plan}) => {
  plan(10);

  deepEqual(
    tform([
      checkbox({"name": "[]", "value": "foo", checked}),
      checkbox({"name": "[]", "value": "bar"}),
      checkbox({"name": "[]", "value": "baz", checked}),
    ]),
    ["foo", "baz"],
    "Explicit"
  );

  deepEqual(
    tform([
      checkbox({"name": "[]", "value": "foo"}),
      checkbox({"name": "[]", "value": "bar"}),
      checkbox({"name": "[]", "value": "baz"}),
    ]),
    [],
    "Explicit -- empty"
  );

  deepEqual(
    tform([
      checkbox({"value": "foo", checked}),
      checkbox({"value": "bar"}),
      checkbox({"value": "baz", checked}),
    ]),
    ["foo", "baz"],
    "Implicit"
  );

  deepEqual(
    tform([
      checkbox({"value": "foo"}),
      checkbox({"value": "bar"}),
      checkbox({"value": "baz"}),
    ]),
    [],
    "Implicit -- empty"
  );

  deepEqual(
    tform([
      input({"name": "name", "value": "foo"}),
      checkbox({"name": "values[]", "value": "bar", checked}),
      checkbox({"name": "values[]", "value": "baz"}),
      checkbox({"name": "values[]", "value": "quux", checked}),
    ]),
    {"name": "foo", "values": ["bar", "quux"]},
    "Explicit as object leaf"
  );

  deepEqual(
    tform([
      input({"name": "name", "value": "foo"}),
      checkbox({"name": "values[]", "value": "foo"}),
      checkbox({"name": "values[]", "value": "bar"}),
      checkbox({"name": "values[]", "value": "baz"}),
    ]),
    {"name": "foo", "values": []},
    "Explicit as object leaf -- empty"
  );

  deepEqual(
    tform([
      input({"name": "name", "value": "foo"}),
      checkbox({"name": "values", "value": "bar", checked}),
      checkbox({"name": "values", "value": "baz"}),
      checkbox({"name": "values", "value": "quux", checked}),
    ]),
    {"name": "foo", "values": ["bar", "quux"]},
    "Implicit as object leaf"
  );

  deepEqual(
    tform([
      input({"name": "name", "value": "foo"}),
      checkbox({"name": "values", "value": "foo"}),
      checkbox({"name": "values", "value": "bar"}),
      checkbox({"name": "values", "value": "baz"}),
    ]),
    {"name": "foo", "values": []},
    "Implicit as object leaf -- empty"
  );

  deepEqual(
    tform([checkbox(), checkbox(), checkbox()]),
    [false, false, false],
    "Array of booleans"
  );

  deepEqual(
    tform([
      input({"name": "name", "value": "booleans"}),
      checkbox({"name": "values"}),
      checkbox({"name": "values"}),
      checkbox({"name": "values"}),
    ]),
    {"name": "booleans", "values": [false, false, false]},
    "Array of booleans as object leaf"
  );
});

test("Filter", ({equal, ok, plan}) => {
  plan(6);

  let someDisabled = form([
    input({"value": "disabled", disabled}),
    input({"value": "enabled"}),
  ]);

  ok(typeof formsquare((x) => x) === "function", "Curry");

  equal(
    formsquare(someDisabled, (el) => !el.disabled),
    "enabled",
    "No disabled"
  );

  equal(
    formsquare((el) => !el.disabled)(someDisabled),
    "enabled",
    "No disabled -- curry"
  );

  equal(
    formsquare(someDisabled, (el) => el.disabled),
    "disabled",
    "Only disabled"
  );

  equal(
    formsquare(form([
      input({"class": "shown", "value": "shown"}),
      input({"class": "hidden", "value": "hidden"}),
    ]), (el) => !el.classList.contains("hidden")),
    "shown",
    "No hidden"
  );

  equal(
    formsquare(form([
      checkbox({"value": "enabled", checked}),
      checkbox({"value": "disabled", checked, disabled}),
    ]), (el) => !el.disabled),
    "enabled",
    "Does not affect array behavior"
    // I.e. not ["enabled", "disabled"].
  );
});

test("html-json-forms examples", ({deepEqual, plan}) => {
  plan(9);

  deepEqual(
    tform([
      input({"name": "name", "value": "Bender"}),
      select({"name": "hind"}, [
        option({selected}, "Bitable"),
        option("Kickable"),
      ]),
      checkbox({"name": "shiny", checked}),
    ]),
    {"name": "Bender", "hind": "Bitable", "shiny": true},
    "Example 1: Basic Keys"
  );

  deepEqual(
    tform([
      input({"type": "number", "name": "bottle-on-wall", "value": "1"}),
      input({"type": "number", "name": "bottle-on-wall", "value": "2"}),
      input({"type": "number", "name": "bottle-on-wall", "value": "3"}),
    ]),
    {"bottle-on-wall": [1, 2, 3]},
    "Example 2: Multiple Values"
  );

  deepEqual(
    tform([
      input({"name": "pet[species]", "value": "Dahut"}),
      input({"name": "pet[name]", "value": "Hypatia"}),
      input({"name": "kids[1]", "value": "Thelma"}),
      input({"name": "kids[0]", "value": "Ashley"}),
    ]),
    {
      "pet": {
        "species": "Dahut",
        "name": "Hypatia",
      },
      "kids": ["Ashley", "Thelma"],
    },
    "Example 3: Deeper Structure"
  );

  deepEqual(
    tform([
      input({"name": "hearbeat[0]", "value": "thunk"}),
      input({"name": "hearbeat[2]", "value": "thunk"}),
    ]),
    {"hearbeat": ["thunk", null, "thunk"]},
    "Example 4: Sparse Arrays"
  );

  deepEqual(
    tform([
      input({"name": "pet[0][species]", "value": "Dahut"}),
      input({"name": "pet[0][name]", "value": "Hypatia"}),
      input({"name": "pet[1][species]", "value": "Felis Stultus"}),
      input({"name": "pet[1][name]", "value": "Billie"}),
    ]),
    {"pet": [
      {"species": "Dahut", "name": "Hypatia"},
      {"species": "Felis Stultus", "name": "Billie"},
    ]},
    "Example 5: Even Deeper"
  );

  deepEqual(
    tform([
      input({"name": "wow[such][deep][3][much][power][!]", "value": "Amaze"}),
    ]),
    {"wow": {"such": {"deep": [
      null,
      null,
      null,
      {"much": {"power": {"!": "Amaze"}}},
    ]}}},
    "Example 6: Such Deep"
  );

  deepEqual(
    tform([
      input({"name": "mix", "value": "scalar"}),
      input({"name": "mix[0]", "value": "array 1"}),
      input({"name": "mix[2]", "value": "array 2"}),
      input({"name": "mix[key]", "value": "key key"}),
      input({"name": "mix[car]", "value": "car key"}),
    ]),
    {"mix": {
      "": "scalar",
      "0": "array 1",
      "2": "array 2",
      "key": "key key",
      "car": "car key",
    }},
    "Example 7: Merge Behaviour"
  );

  deepEqual(
    tform([input({"name": "highlander[]", "value": "one"})]),
    {"highlander": ["one"]},
    "Example 8: Append"
  );

  deepEqual(
    tform([
      input({"name": "error[good]", "value": "BOOM!"}),
      input({"name": "error[bad", "value": "BOOM! BOOM!"}),
    ]),
    {
      "error": {"good": "BOOM!"},
      "error[bad": "BOOM! BOOM!",
    },
    "Example 10: Bad Input"
  );
});


function tform(inputs) {
  return formsquare(form(inputs));
}

function option(attributes, content) {
  if (typeof attributes === "string") {
    content = attributes;
    attributes = {};
  }

  return crel("option", attributes, [text(content)]);
}

function select(attributes={}, options=[]) {
  return crel("select", attributes, options);
}

function textarea(attributes, content) {
  if (typeof attributes === "string") {
    content = attributes;
    attributes = {};
  }

  return crel("textarea", attributes, [text(content)]);
}

function checkbox(attributes={}) {
  let el = input(attributes);

  el.type = "checkbox";

  return el;
}

function input(attributes={}) {
  return crel("input", attributes);
}

function form(attributes={}, inputs=[]) {
  return crel("form", attributes, inputs);
}

function text(str) {
  return document.createTextNode(str);
}

function crel(tagName, attributes={}, children=[]) {
  let el = document.createElement(tagName);

  if (Array.isArray(attributes)) {
    children = attributes;
    attributes = {};
  }

  Object.keys(attributes).forEach(
    (attr) => el.setAttribute(attr, attributes[attr])
  );

  children.forEach((child) => el.appendChild(
    typeof child === "string" ? crel(child) : child
  ));

  return el;
}
