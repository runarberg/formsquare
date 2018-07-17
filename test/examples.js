// Examples taken from
// https://www.w3.org/TR/html-json-forms/

import test from "ava";
import browserEnv from "browser-env";

import { checkbox, input, option, select, tform } from "./utils.js";

browserEnv(["File", "FileList", "FileReader", "btoa", "navigator"]);

test("Example 1: Basic Keys", t => {
  t.deepEqual(
    tform([
      input({ name: "name", value: "Bender" }),
      select({ name: "hind" }, [
        option({ selected: true }, "Bitable"),
        option("Kickable"),
      ]),
      checkbox({ name: "shiny", checked: true }),
    ]),
    { name: "Bender", hind: "Bitable", shiny: true },
  );
});

test("Example 2: Multiple Values", t => {
  t.deepEqual(
    tform([
      input({ type: "number", name: "bottle-on-wall", value: "1" }),
      input({ type: "number", name: "bottle-on-wall", value: "2" }),
      input({ type: "number", name: "bottle-on-wall", value: "3" }),
    ]),
    { "bottle-on-wall": [1, 2, 3] },
  );
});

test("Example 3: Deeper Structure", t => {
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
  );
});

test("Example 4: Sparse Arrays", t => {
  t.deepEqual(
    tform([
      input({ name: "hearbeat[0]", value: "thunk" }),
      input({ name: "hearbeat[2]", value: "thunk" }),
    ]),
    { hearbeat: ["thunk", null, "thunk"] },
  );
});

test("Example 5: Even Deeper", t => {
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
  );
});

test("Example 6: Such Deep", t => {
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
  );
});

test("Example 7: Merge Behaviour", t => {
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
  );
});

test("Example 8: Append", t => {
  t.deepEqual(tform([input({ name: "highlander[]", value: "one" })]), {
    highlander: ["one"],
  });
});

test("Example 9: Files", async t => {
  const fileInput = input({ type: "file", name: "file", multiple: true });

  {
    // Mock the file inputs.

    // New FileList() is not a constructor?
    const fileList = Object.create(FileList.prototype);

    fileList[0] = new File(["DAAAAAAAHUUUUUUUUUT!!!"], "dahut.txt", {
      type: "text/plain",
    });

    fileList[1] = new File(
      ["I must not fear. Fear is the mind-killer."],
      "litany.txt",
      {
        type: "text/plain",
      },
    );

    // Need to do this manually.
    Object.defineProperty(fileList, "length", {
      value: 2,
      writeable: false,
    });

    // Setting directly is not allowed.
    Object.defineProperty(fileInput, "files", {
      value: fileList,
      writeable: false,
    });
  }

  const result = tform([fileInput]);
  result.file = await result.file;

  // JSDOM implements FilerReader#readAsDataURL() differently from
  // all the browsers. Until that is fixed, we need this spoof
  if (navigator.userAgent.match(/jsdom\/11\.\d+\.\d+$/)) {
    result.file.forEach(file => {
      const { body } = file;
      // eslint-disable-next-line no-param-reassign
      file.body = btoa(body);
    });
  }

  t.deepEqual(result, {
    file: [
      {
        type: "text/plain",
        name: "dahut.txt",
        body: "REFBQUFBQUFIVVVVVVVVVVVVVCEhIQ==",
      },
      {
        type: "text/plain",
        name: "litany.txt",
        body:
          "SSUyMG11c3QlMjBub3QlMjBmZWFyLiUyMEZlYXIlMjBpcyUyMHRoZSUyMG1pbmQta2lsbGVyLg==",
      },
    ],
  });
});

test("Example 10: Bad Input", t => {
  t.deepEqual(
    tform([
      input({ name: "error[good]", value: "BOOM!" }),
      input({ name: "error[bad", value: "BOOM! BOOM!" }),
    ]),
    {
      error: { good: "BOOM!" },
      "error[bad": "BOOM! BOOM!",
    },
  );
});
