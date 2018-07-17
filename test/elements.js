import test from "ava";

import formsquare from "../src/module.js";

import {
  checkbox,
  crel,
  form,
  input,
  option,
  select,
  text,
  textarea,
  tform,
} from "./utils.js";

const loremIpsum = "Lorem ipsum dolar sit amet";

test('<input type="radio">', t => {
  t.deepEqual(
    tform([
      input({ type: "radio", name: "radio", value: "1" }),
      input({ type: "radio", name: "radio", value: "2", checked: true }),
      input({ type: "radio", name: "radio", value: "3" }),
    ]),
    { radio: "2" },
  );
});

test("<select>", t => {
  t.is(
    tform([
      select([option("foo"), option({ selected: true }, "bar"), option("baz")]),
    ]),
    "bar",
  );
});

test("<select value>", t => {
  t.deepEqual(
    tform([
      select({ name: "select" }, [
        option({ value: "1" }, [text("foo")]),
        option({ value: "2", selected: true }, [text("bar")]),
        option({ value: "3" }, [text("baz")]),
      ]),
    ]),
    { select: "2" },
    "Select by value",
  );
});

test("<select multible>", t => {
  t.deepEqual(
    tform([
      select({ multiple: true }, [
        option({ selected: true }, "foo"),
        option({ selected: true }, "bar"),
        option("baz"),
      ]),
    ]),
    ["foo", "bar"],
  );
});

test("<select multible> - empty", t => {
  t.deepEqual(
    tform([
      select({ multiple: true }, [option("foo"), option("bar"), option("baz")]),
    ]),
    [],
  );
});

test('<input type="file"> - empty', async t => {
  // We are not able to test real file inputs in real browsers.
  const files = await tform([input({ type: "file", multiple: true })]);
  t.deepEqual(files, []);
});

test("<textarea>", t => {
  t.is(tform([textarea(loremIpsum)]), loremIpsum, "Textarea");
});

test("<textarea name>", t => {
  t.deepEqual(
    tform([textarea({ name: "text" }, loremIpsum)]),
    { text: loremIpsum },
    "Textarea with name",
  );
});

test("<input form>", t => {
  t.plan(1);

  const form0 = form({ id: "form-0" }, [
    checkbox({ name: "inside", checked: true }),
    input({ name: "both[0]", value: "foo" }),
  ]);

  const div = crel("div", [
    form0,
    textarea({ form: "form-0", name: "outside" }, loremIpsum),
    input({ form: "form-0", name: "both[1]", value: "bar" }),
  ]);

  const { documentElement: body } = document;

  if (body) {
    body.appendChild(div);
  }

  t.deepEqual(formsquare.parse(form0), {
    inside: true,
    outside: loremIpsum,
    both: ["foo", "bar"],
  });

  div.remove();
});
