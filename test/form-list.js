import test from "ava";

import formsquare from "../src/formsquare.js";
import { crel, form, input } from "./utils.js";

test("simple object", (t) => {
  t.deepEqual(
    formsquare.parse(
      crel("div", [
        form([input({ name: "foo", value: "bar" })]),
        form([input({ name: "baz", value: "quux" })]),
      ]).querySelectorAll("form"),
    ),
    { foo: "bar", baz: "quux" },
  );
});

test("merge arrays cross forms", (t) => {
  t.deepEqual(
    formsquare.parse(
      crel("div", [
        form([input({ type: "number", value: "5" })]),
        form([input({ type: "number", value: "42" })]),
      ]).querySelectorAll("form"),
    ),
    [5, 42],
  );
});

test("an array of forms", (t) => {
  t.deepEqual(
    formsquare.parse([
      form([input({ name: "foo", value: "bar" })]),
      form([input({ name: "baz", value: "quux" })]),
    ]),
    { foo: "bar", baz: "quux" },
  );
});
