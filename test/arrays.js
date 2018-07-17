import test from "ava";

import { tform, input } from "./utils.js";

test("square brackets", t => {
  t.deepEqual(tform([input({ name: "[]", value: "bar" })]), ["bar"]);

  t.deepEqual(
    tform([
      input({ name: "[]", value: "foo" }),
      input({ name: "[]", value: "bar" }),
    ]),
    ["foo", "bar"],
  );
});

test("multiple no-named values", t => {
  t.deepEqual(
    tform([
      input({ name: "", value: "foo" }),
      input({ name: "", value: "bar" }),
    ]),
    ["foo", "bar"],
  );
});

test("enumerated", t => {
  t.deepEqual(
    tform([
      input({ name: "[1]", value: "foo" }),
      input({ name: "[0]", value: "bar" }),
    ]),
    ["bar", "foo"],
  );
});

test("sparse", t => {
  t.deepEqual(
    tform([
      input({ name: "[2]", value: "foo" }),
      input({ name: "[0]", value: "bar" }),
    ]),
    ["bar", null, "foo"],
  );
});
