import test from "ava";

import formsquare from "../src/module.js";
import { form, input } from "./utils.js";

test("basic", t => {
  const inputs = form([input({ value: "foo" })]);

  t.is(formsquare.map(() => "bar").parse(inputs), "bar");
});

test("data-type", t => {
  const inputs = form([
    input({ name: "date", value: "2018-09-01", "data-type": "date" }),
    input({ name: "number", value: "1", "data-type": "number" }),
  ]);

  t.deepEqual(
    formsquare
      .map((defaultValue, el) =>
        el.dataset.type === "number"
          ? Number.parseFloat(el.value)
          : defaultValue,
      )
      .map((defaultValue, el) =>
        el.dataset.type === "date" ? new Date(el.value) : defaultValue,
      )
      .parse(inputs),
    { date: new Date("2018-09-01"), number: 1 },
  );
});
