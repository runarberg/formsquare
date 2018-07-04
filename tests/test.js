import * as pkg from "..";
import test from "ava";

test("Named exports", (t) => {
  t.is(pkg.NAME, "formsquare", "Name");
  t.truthy(pkg.VERSION.match(/\d+\.\d+\.\d+/), "Version");
  t.true(typeof pkg.default === "function", "formsquare()");
  t.is(pkg.formsquare, pkg.default, "Default");
});
