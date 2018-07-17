import test from "ava";

import { tform, input } from "./utils.js";

test("basic", t => {
  t.deepEqual(tform([input({ name: "foo", value: "bar" })]), { foo: "bar" });

  t.deepEqual(tform([input({ type: "number", name: "foo", value: 42 })]), {
    foo: 42,
  });
});

test("nested", t => {
  t.deepEqual(tform([input({ type: "number", name: "foo[bar]", value: 42 })]), {
    foo: { bar: 42 },
  });
});

test("arrays of objects", t => {
  t.deepEqual(
    tform([
      input({ name: "[0][name]", value: "foo" }),
      input({ type: "number", name: "[0][value]", value: "5" }),
      input({ name: "[1][name]", value: "bar" }),
      input({ type: "number", name: "[1][value]", value: "42" }),
    ]),
    [{ name: "foo", value: 5 }, { name: "bar", value: 42 }],
  );
});
