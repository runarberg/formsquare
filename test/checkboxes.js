import test from "ava";

import { checkbox, input, tform } from "./utils.js";

test("unchecked", t => {
  t.false(tform([checkbox()]));
});

test("checked", t => {
  t.true(tform([checkbox({ checked: true })]));
});

test("with name - unchecked", t => {
  t.deepEqual(tform([checkbox({ name: "foo" })]), { foo: false });
});

test("with name - checked", t => {
  t.deepEqual(tform([checkbox({ name: "foo", checked: true })]), { foo: true });
});

test("with value - unchecked", t => {
  t.is(tform([checkbox({ value: "bar" })]), null);
});

test("with value - checked", t => {
  t.is(tform([checkbox({ value: "bar", checked: true })]), "bar");
});

test("with name and value - unchecked", t => {
  t.deepEqual(tform([checkbox({ name: "foo", value: "bar" })]), { foo: null });
});

test("with name and value - checked", t => {
  t.deepEqual(tform([checkbox({ name: "foo", value: "bar", checked: true })]), {
    foo: "bar",
  });
});

test('with name="[]"', t => {
  t.deepEqual(
    tform([
      checkbox({ name: "[]", value: "foo", checked: true }),
      checkbox({ name: "[]", value: "bar" }),
      checkbox({ name: "[]", value: "baz", checked: true }),
    ]),
    ["foo", "baz"],
  );
});

test('with name="[]" - empty', t => {
  t.deepEqual(
    tform([
      checkbox({ name: "[]", value: "foo" }),
      checkbox({ name: "[]", value: "bar" }),
      checkbox({ name: "[]", value: "baz" }),
    ]),
    [],
  );
});

test("multiple no name", t => {
  t.deepEqual(
    tform([
      checkbox({ value: "foo", checked: true }),
      checkbox({ value: "bar" }),
      checkbox({ value: "baz", checked: true }),
    ]),
    ["foo", "baz"],
  );
});

test("multiple no name - empty", t => {
  t.deepEqual(
    tform([
      checkbox({ value: "foo" }),
      checkbox({ value: "bar" }),
      checkbox({ value: "baz" }),
    ]),
    [],
  );
});

test('with name="leaf[]"', t => {
  t.deepEqual(
    tform([
      input({ name: "name", value: "foo" }),
      checkbox({ name: "values[]", value: "bar", checked: true }),
      checkbox({ name: "values[]", value: "baz" }),
      checkbox({ name: "values[]", value: "quux", checked: true }),
    ]),
    { name: "foo", values: ["bar", "quux"] },
    "Explicit as object leaf",
  );
});

test('with name="leaf[]" - first empty', t => {
  t.deepEqual(
    tform([
      checkbox({ name: "values[]", value: "foo" }),
      checkbox({ name: "values[]", value: "bar", checked: true }),
      checkbox({ name: "values[]", value: "baz", checked: true }),
      input({ name: "name", value: "quux" }),
    ]),
    { name: "quux", values: ["bar", "baz"] },
  );
});

test('with name="leaf[]" - all empty', t => {
  t.deepEqual(
    tform([
      input({ name: "name", value: "foo" }),
      checkbox({ name: "values[]", value: "foo" }),
      checkbox({ name: "values[]", value: "bar" }),
      checkbox({ name: "values[]", value: "baz" }),
    ]),
    { name: "foo", values: [] },
  );
});

test('with name="leaf[]" - single leaf', t => {
  t.deepEqual(
    tform([
      checkbox({ name: "values[]", value: "bar", checked: true }),
      checkbox({ name: "values[]", value: "baz" }),
      checkbox({ name: "values[]", value: "quux", checked: true }),
    ]),
    { values: ["bar", "quux"] },
  );
});

test('with name="leaf[]" - all empty and single leaf', t => {
  t.deepEqual(
    tform([
      checkbox({ name: "values[]", value: "bar" }),
      checkbox({ name: "values[]", value: "baz" }),
      checkbox({ name: "values[]", value: "quux" }),
    ]),
    { values: [] },
  );
});

test('multiple with name="leaf"', t => {
  t.deepEqual(
    tform([
      input({ name: "name", value: "foo" }),
      checkbox({ name: "values", value: "bar", checked: true }),
      checkbox({ name: "values", value: "baz" }),
      checkbox({ name: "values", value: "quux", checked: true }),
    ]),
    { name: "foo", values: ["bar", "quux"] },
  );
});

test('multiple with name="leaf" - empty', t => {
  t.deepEqual(
    tform([
      input({ name: "name", value: "foo" }),
      checkbox({ name: "values", value: "foo" }),
      checkbox({ name: "values", value: "bar" }),
      checkbox({ name: "values", value: "baz" }),
    ]),
    { name: "foo", values: [] },
  );
});

test("miltiple with no name and no value", t => {
  t.deepEqual(
    tform([checkbox(), checkbox(), checkbox()]),
    [false, false, false],
    "Array of booleans",
  );
});

test('multiple with name="leaf" and no value', t => {
  t.deepEqual(
    tform([
      input({ name: "name", value: "booleans" }),
      checkbox({ name: "values" }),
      checkbox({ name: "values" }),
      checkbox({ name: "values" }),
    ]),
    { name: "booleans", values: [false, false, false] },
  );
});
