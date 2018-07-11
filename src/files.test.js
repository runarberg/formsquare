import browserEnv from "browser-env";
import test from "ava";

import { readFile } from "./files.js";

browserEnv(["window", "File", "FileReader", "btoa", "navigator"]);

test("readfile", t =>
  readFile(new File(["foo"], "foo.txt", { type: "text/plain" })).then(file => {
    // JSDOM implements FilerReader#readAsDataURL() differently from
    // all the browsers. Until that is fixed, we need this spoof
    if (navigator.userAgent.match(/jsdom\/11\.\d+\.\d+$/)) {
      file.body = btoa("foo");
    }

    t.deepEqual(
      file,
      {
        body: "Zm9v",
        name: "foo.txt",
        type: "text/plain",
      },
      "Base64 encodes the content",
    );
  }));
