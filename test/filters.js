import test from "ava";

import formsquare from "../src/module.js";
import { checkbox, form, input } from "./utils.js";

test("basic", (t) => {
  const someDisabled = form([
    input({ value: "disabled", disabled: true }),
    input({ value: "enabled" }),
  ]);

  t.is(formsquare.filter((el) => !el.disabled).parse(someDisabled), "enabled");
  t.is(formsquare.filter((el) => el.disabled).parse(someDisabled), "disabled");
});

test("classes", (t) => {
  t.is(
    formsquare
      .filter((el) => !el.classList.contains("hidden"))
      .parse(
        form([
          input({ class: "shown", value: "shown" }),
          input({ class: "hidden", value: "hidden" }),
        ]),
      ),
    "shown",
  );
});

test("filters return a bound object", (t) => {
  const { parse } = formsquare.filter((el) => !el.disabled);

  t.is(
    parse(
      form([
        input({ value: "disabled", disabled: true }),
        input({ value: "enabled" }),
      ]),
    ),
    "enabled",
  );

  t.is(
    parse(
      form([
        input({ value: "disabled", disabled: true }),
        input({ value: "second call is OK" }),
      ]),
    ),
    "second call is OK",
  );
});

test("chaining works", (t) => {
  const someDisabled = form([
    input({ value: "disabled", disabled: true }),
    input({ value: "hidden", class: "hidden" }),
    input({ value: "enabled" }),
  ]);

  t.is(
    formsquare
      .filter((el) => !el.disabled)
      .filter((el) => !el.classList.contains("hidden"))
      .parse(someDisabled),
    "enabled",
  );
});

test("chaining works does not mutate old parser", (t) => {
  const someDisabled = form([
    input({ value: "disabled", disabled: true }),
    input({ value: "hidden", class: "hidden" }),
    input({ value: "enabled" }),
  ]);

  const myParser = formsquare.filter((el) => !el.disabled);

  t.deepEqual(myParser.parse(someDisabled), ["hidden", "enabled"]);

  t.is(
    myParser
      .filter((el) => !el.classList.contains("hidden"))
      .parse(someDisabled),
    "enabled",
  );

  t.deepEqual(myParser.parse(someDisabled), ["hidden", "enabled"]);
});

test("does not affect array behavior", (t) => {
  t.is(
    formsquare
      .filter((el) => !el.disabled)
      .parse(
        form([
          checkbox({ value: "enabled", checked: true }),
          checkbox({ value: "disabled", checked: true, disabled: true }),
        ]),
      ),
    "enabled",
    // I.e. not ["enabled", "disabled"].
  );
});
