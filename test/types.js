import test from "ava";

import { tform, input } from "./utils.js";

test("number", t => {
  t.is(tform([input({ type: "number", value: "1" })]), 1);
});

test("boolean", t => {
  t.is(tform([input({ type: "checkbox", checked: true })]), true);
});

test("string", t => {
  t.is(tform([input({ type: "text", value: "1" })]), "1");
});

test("month", t => {
  t.deepEqual(
    tform([input({ type: "month", value: "1989-03" })]),
    new Date("1989-03"),
  );
});

test("week", t => {
  t.deepEqual(
    tform([input({ type: "week", value: "2009-W01" })]),
    new Date("2008-12-29"),
  );
});

test("week - invalid", t => {
  t.is(tform([input({ type: "week", value: "1989-10" })]), "1989-10");
});

test("date", t => {
  t.deepEqual(
    tform([input({ type: "date", value: "1989-03-10" })]),
    new Date("1989-03-10"),
  );
});

test("datetime-local", t => {
  t.deepEqual(
    tform([input({ type: "datetime-local", value: "1989-03-10T21:00:00" })]),
    new Date("1989-03-10T21:00:00"),
  );
});

test("file", async t => {
  // We are not able to test real file input in real browsers:
  const file = await tform([input({ type: "file" })]);

  t.is(file, null, "File");
});
