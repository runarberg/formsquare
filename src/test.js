import browserEnv from "browser-env";
import test from "ava";

import formsquare from "./formsquare.js";

browserEnv(["window", "document", "NodeList"]);

const checked = true;
const disabled = true;
const selected = true;

test("Types", t => {
  t.deepEqual(tform(), null, "null (empty form)");

  t.is(tform([input({ type: "number", value: "1" })]), 1, "Number");

  t.is(tform([input({ type: "checkbox", checked })]), true, "Boolean");

  t.is(tform([input({ type: "text", value: "1" })]), "1", "String");

  t.deepEqual(
    tform([input({ type: "month", value: "1989-03" })]),
    new Date("1989-03"),
    "Month",
  );

  t.deepEqual(
    tform([input({ type: "week", value: "2009-W01" })]),
    new Date("2008-12-29"),
    "Week",
  );

  t.is(
    tform([input({ type: "week", value: "1989-10" })]),
    "1989-10",
    "Week -- invalid",
  );

  t.deepEqual(
    tform([input({ type: "date", value: "1989-03-10" })]),
    new Date("1989-03-10"),
    "Date",
  );

  t.deepEqual(
    tform([input({ type: "datetime-local", value: "1989-03-10T21:00:44" })]),
    new Date("1989-03-10T21:00:44"),
    "Datetime-local",
  );

  // We are not able to test real file input in real browsers:
  tform([input({ type: "file" })]).then(file => {
    t.deepEqual(file, null, "File");
  });
});

test("Collection types", t => {
  t.deepEqual(
    tform([input({ name: "foo", value: "bar" })]),
    { foo: "bar" },
    "Object",
  );

  t.deepEqual(tform([input({ name: "[]", value: "bar" })]), ["bar"], "Array");
});

test("Arrays", t => {
  t.deepEqual(
    tform([
      input({ name: "[]", value: "foo" }),
      input({ name: "[]", value: "bar" }),
    ]),
    ["foo", "bar"],
    "Square brackets",
  );

  t.deepEqual(
    tform([
      input({ name: "", value: "foo" }),
      input({ name: "", value: "bar" }),
    ]),
    ["foo", "bar"],
    "Multiple no-named values",
  );

  t.deepEqual(
    tform([
      input({ name: "[1]", value: "foo" }),
      input({ name: "[0]", value: "bar" }),
    ]),
    ["bar", "foo"],
    "Enumerated",
  );

  t.deepEqual(
    tform([
      input({ name: "[2]", value: "foo" }),
      input({ name: "[0]", value: "bar" }),
    ]),
    ["bar", null, "foo"],
    "Sparse",
  );
});

test("Objects", t => {
  t.deepEqual(
    tform([input({ type: "number", name: "foo", value: 42 })]),
    { foo: 42 },
    "Basic",
  );

  t.deepEqual(
    tform([input({ type: "number", name: "foo[bar]", value: 42 })]),
    { foo: { bar: 42 } },
    "Nested",
  );

  t.deepEqual(
    tform([
      input({ name: "[0][name]", value: "foo" }),
      input({ type: "number", name: "[0][value]", value: "5" }),
      input({ name: "[1][name]", value: "bar" }),
      input({ type: "number", name: "[1][value]", value: "42" }),
    ]),
    [{ name: "foo", value: 5 }, { name: "bar", value: 42 }],
    "Arrays of objects",
  );
});

test("Form elements", t => {
  let loremIpsum = "Lorem ipsum dolar sit amet";

  t.deepEqual(
    tform([
      input({ type: "radio", name: "radio", value: "1" }),
      input({ type: "radio", name: "radio", value: "2", checked }),
      input({ type: "radio", name: "radio", value: "3" }),
    ]),
    { radio: "2" },
    "Input type radio",
  );

  t.is(
    tform([
      select([option("foo"), option({ selected }, "bar"), option("baz")]),
    ]),
    "bar",
    "Select by content",
  );

  t.deepEqual(
    tform([
      select({ name: "select" }, [
        option({ value: "1" }, [text("foo")]),
        option({ value: "2", selected }, [text("bar")]),
        option({ value: "3" }, [text("baz")]),
      ]),
    ]),
    { select: "2" },
    "Select by value",
  );

  t.deepEqual(
    tform([
      select({ multiple: true }, [
        option({ selected }, "foo"),
        option({ selected }, "bar"),
        option("baz"),
      ]),
    ]),
    ["foo", "bar"],
    "Select multiple",
  );

  t.deepEqual(
    tform([
      select({ multiple: true }, [option("foo"), option("bar"), option("baz")]),
    ]),
    [],
    "Select multiple -- empty",
  );

  // We are not able to test real file inputs in real browsers.
  tform([input({ type: "file", multiple: true })]).then(files => {
    t.deepEqual(files, [], "File input multiple -- empty");
  });

  t.is(tform([textarea(loremIpsum)]), loremIpsum, "Textarea");

  t.deepEqual(
    tform([textarea({ name: "text" }, loremIpsum)]),
    { text: loremIpsum },
    "Textarea with name",
  );

  let div = crel("div", [
    form({ id: "form-0" }, [
      checkbox({ name: "inside", checked }),
      input({ name: "both[0]", value: "foo" }),
    ]),
    textarea({ form: "form-0", name: "outside" }, loremIpsum),
    input({ form: "form-0", name: "both[1]", value: "bar" }),
  ]);

  document.documentElement.appendChild(div);

  t.deepEqual(
    formsquare(document.getElementById("form-0")),
    { inside: true, outside: loremIpsum, both: ["foo", "bar"] },
    "Outside and inside forms",
  );

  document.documentElement.removeChild(div);
});

test("Checkboxes", t => {
  t.false(tform([checkbox()]), "Unchecked");
  t.true(tform([checkbox({ checked })]), "Checked");

  t.deepEqual(
    tform([checkbox({ name: "foo" })]),
    { foo: false },
    "Name -- unchecked",
  );

  t.deepEqual(
    tform([checkbox({ name: "foo", checked })]),
    { foo: true },
    "Name -- checked",
  );

  t.is(tform([checkbox({ value: "bar" })]), null, "Value -- unchecked");

  t.is(tform([checkbox({ value: "bar", checked })]), "bar", "Value -- checked");

  t.deepEqual(
    tform([checkbox({ name: "foo", value: "bar" })]),
    { foo: null },
    "Name + value -- unchecked",
  );

  t.deepEqual(
    tform([checkbox({ name: "foo", value: "bar", checked })]),
    { foo: "bar" },
    "Name + value -- checked",
  );
});

test("Checkbox arrays", t => {
  t.deepEqual(
    tform([
      checkbox({ name: "[]", value: "foo", checked }),
      checkbox({ name: "[]", value: "bar" }),
      checkbox({ name: "[]", value: "baz", checked }),
    ]),
    ["foo", "baz"],
    "Explicit",
  );

  t.deepEqual(
    tform([
      checkbox({ name: "[]", value: "foo" }),
      checkbox({ name: "[]", value: "bar" }),
      checkbox({ name: "[]", value: "baz" }),
    ]),
    [],
    "Explicit -- empty",
  );

  t.deepEqual(
    tform([
      checkbox({ value: "foo", checked }),
      checkbox({ value: "bar" }),
      checkbox({ value: "baz", checked }),
    ]),
    ["foo", "baz"],
    "Implicit",
  );

  t.deepEqual(
    tform([
      checkbox({ value: "foo" }),
      checkbox({ value: "bar" }),
      checkbox({ value: "baz" }),
    ]),
    [],
    "Implicit -- empty",
  );

  t.deepEqual(
    tform([
      input({ name: "name", value: "foo" }),
      checkbox({ name: "values[]", value: "bar", checked }),
      checkbox({ name: "values[]", value: "baz" }),
      checkbox({ name: "values[]", value: "quux", checked }),
    ]),
    { name: "foo", values: ["bar", "quux"] },
    "Explicit as object leaf",
  );

  t.deepEqual(
    tform([
      checkbox({ name: "values[]", value: "foo" }),
      checkbox({ name: "values[]", value: "bar", checked }),
      checkbox({ name: "values[]", value: "baz", checked }),
      input({ name: "name", value: "quux" }),
    ]),
    { name: "quux", values: ["bar", "baz"] },
    "Explicit as object leaf -- first empty",
  );

  t.deepEqual(
    tform([
      input({ name: "name", value: "foo" }),
      checkbox({ name: "values[]", value: "foo" }),
      checkbox({ name: "values[]", value: "bar" }),
      checkbox({ name: "values[]", value: "baz" }),
    ]),
    { name: "foo", values: [] },
    "Explicit as object leaf -- empty",
  );

  t.deepEqual(
    tform([
      checkbox({ name: "values[]", value: "bar", checked }),
      checkbox({ name: "values[]", value: "baz" }),
      checkbox({ name: "values[]", value: "quux", checked }),
    ]),
    { values: ["bar", "quux"] },
    "Explicit as a single object leaf",
  );

  t.deepEqual(
    tform([
      checkbox({ name: "values[]", value: "bar" }),
      checkbox({ name: "values[]", value: "baz" }),
      checkbox({ name: "values[]", value: "quux" }),
    ]),
    { values: [] },
    "Explicit as a single object leaf -- empty",
  );

  t.deepEqual(
    tform([
      input({ name: "name", value: "foo" }),
      checkbox({ name: "values", value: "bar", checked }),
      checkbox({ name: "values", value: "baz" }),
      checkbox({ name: "values", value: "quux", checked }),
    ]),
    { name: "foo", values: ["bar", "quux"] },
    "Implicit as object leaf",
  );

  t.deepEqual(
    tform([
      input({ name: "name", value: "foo" }),
      checkbox({ name: "values", value: "foo" }),
      checkbox({ name: "values", value: "bar" }),
      checkbox({ name: "values", value: "baz" }),
    ]),
    { name: "foo", values: [] },
    "Implicit as object leaf -- empty",
  );

  t.deepEqual(
    tform([checkbox(), checkbox(), checkbox()]),
    [false, false, false],
    "Array of booleans",
  );

  t.deepEqual(
    tform([
      input({ name: "name", value: "booleans" }),
      checkbox({ name: "values" }),
      checkbox({ name: "values" }),
      checkbox({ name: "values" }),
    ]),
    { name: "booleans", values: [false, false, false] },
    "Array of booleans as object leaf",
  );
});

test("Filter", t => {
  let someDisabled = form([
    input({ value: "disabled", disabled }),
    input({ value: "enabled" }),
  ]);

  t.true(typeof formsquare(x => x) === "function", "Curry");

  t.is(formsquare(someDisabled, el => !el.disabled), "enabled", "No disabled");

  t.is(
    formsquare(el => !el.disabled)(someDisabled),
    "enabled",
    "No disabled -- curry",
  );

  t.is(
    formsquare(someDisabled, el => el.disabled),
    "disabled",
    "Only disabled",
  );

  t.is(
    formsquare(
      form([
        input({ class: "shown", value: "shown" }),
        input({ class: "hidden", value: "hidden" }),
      ]),
      el => !el.classList.contains("hidden"),
    ),
    "shown",
    "No hidden",
  );

  t.is(
    formsquare(
      form([
        checkbox({ value: "enabled", checked }),
        checkbox({ value: "disabled", checked, disabled }),
      ]),
      el => !el.disabled,
    ),
    "enabled",
    "Does not affect array behavior",
    // I.e. not ["enabled", "disabled"].
  );
});

test("Collections of forms", t => {
  t.deepEqual(
    formsquare(
      crel("div", [
        form([input({ name: "foo", value: "bar" })]),
        form([input({ name: "baz", value: "quux" })]),
      ]).querySelectorAll("form"),
    ),
    { foo: "bar", baz: "quux" },
    "Simple object",
  );

  t.deepEqual(
    formsquare(
      crel("div", [
        form([input({ type: "number", value: "5" })]),
        form([input({ type: "number", value: "42" })]),
      ]).querySelectorAll("form"),
    ),
    [5, 42],
    "Merge arrays cross forms",
  );

  t.deepEqual(
    formsquare([
      form([input({ name: "foo", value: "bar" })]),
      form([input({ name: "baz", value: "quux" })]),
    ]),
    { foo: "bar", baz: "quux" },
    "An array of forms",
  );
});

test("html-json-forms examples", t => {
  t.deepEqual(
    tform([
      input({ name: "name", value: "Bender" }),
      select({ name: "hind" }, [
        option({ selected }, "Bitable"),
        option("Kickable"),
      ]),
      checkbox({ name: "shiny", checked }),
    ]),
    { name: "Bender", hind: "Bitable", shiny: true },
    "Example 1: Basic Keys",
  );

  t.deepEqual(
    tform([
      input({ type: "number", name: "bottle-on-wall", value: "1" }),
      input({ type: "number", name: "bottle-on-wall", value: "2" }),
      input({ type: "number", name: "bottle-on-wall", value: "3" }),
    ]),
    { "bottle-on-wall": [1, 2, 3] },
    "Example 2: Multiple Values",
  );

  t.deepEqual(
    tform([
      input({ name: "pet[species]", value: "Dahut" }),
      input({ name: "pet[name]", value: "Hypatia" }),
      input({ name: "kids[1]", value: "Thelma" }),
      input({ name: "kids[0]", value: "Ashley" }),
    ]),
    {
      pet: {
        species: "Dahut",
        name: "Hypatia",
      },
      kids: ["Ashley", "Thelma"],
    },
    "Example 3: Deeper Structure",
  );

  t.deepEqual(
    tform([
      input({ name: "hearbeat[0]", value: "thunk" }),
      input({ name: "hearbeat[2]", value: "thunk" }),
    ]),
    { hearbeat: ["thunk", null, "thunk"] },
    "Example 4: Sparse Arrays",
  );

  t.deepEqual(
    tform([
      input({ name: "pet[0][species]", value: "Dahut" }),
      input({ name: "pet[0][name]", value: "Hypatia" }),
      input({ name: "pet[1][species]", value: "Felis Stultus" }),
      input({ name: "pet[1][name]", value: "Billie" }),
    ]),
    {
      pet: [
        { species: "Dahut", name: "Hypatia" },
        { species: "Felis Stultus", name: "Billie" },
      ],
    },
    "Example 5: Even Deeper",
  );

  t.deepEqual(
    tform([
      input({ name: "wow[such][deep][3][much][power][!]", value: "Amaze" }),
    ]),
    {
      wow: {
        such: {
          deep: [null, null, null, { much: { power: { "!": "Amaze" } } }],
        },
      },
    },
    "Example 6: Such Deep",
  );

  t.deepEqual(
    tform([
      input({ name: "mix", value: "scalar" }),
      input({ name: "mix[0]", value: "array 1" }),
      input({ name: "mix[2]", value: "array 2" }),
      input({ name: "mix[key]", value: "key key" }),
      input({ name: "mix[car]", value: "car key" }),
    ]),
    {
      mix: {
        "": "scalar",
        "0": "array 1",
        "2": "array 2",
        key: "key key",
        car: "car key",
      },
    },
    "Example 7: Merge Behaviour",
  );

  t.deepEqual(
    tform([input({ name: "highlander[]", value: "one" })]),
    { highlander: ["one"] },
    "Example 8: Append",
  );

  t.deepEqual(
    tform([
      input({ name: "error[good]", value: "BOOM!" }),
      input({ name: "error[bad", value: "BOOM! BOOM!" }),
    ]),
    {
      error: { good: "BOOM!" },
      "error[bad": "BOOM! BOOM!",
    },
    "Example 10: Bad Input",
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

function select(attributes = {}, options = []) {
  return crel("select", attributes, options);
}

function textarea(attributes, content) {
  if (typeof attributes === "string") {
    content = attributes;
    attributes = {};
  }

  return crel("textarea", attributes, [text(content)]);
}

function checkbox(attributes = {}) {
  let el = input(attributes);

  el.type = "checkbox";

  return el;
}

function input(attributes = {}) {
  return crel("input", attributes);
}

function form(attributes = {}, inputs = []) {
  return crel("form", attributes, inputs);
}

function text(str) {
  return document.createTextNode(str);
}

function crel(tagName, attributes = {}, children = []) {
  let el = document.createElement(tagName);

  if (Array.isArray(attributes)) {
    children = attributes;
    attributes = {};
  }

  Object.keys(attributes).forEach(attr =>
    el.setAttribute(attr, attributes[attr]),
  );

  children.forEach(child =>
    el.appendChild(typeof child === "string" ? crel(child) : child),
  );

  return el;
}
