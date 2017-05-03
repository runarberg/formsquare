import {readFile} from "../src/files";
import test from "tape";


test("Files", ({deepEqual, plan}) => {
  plan(1);

  readFile(new File(["foo"], "foo.txt", {"type": "text/plain"}))
    .then((file) => {
      deepEqual(
        file,
        {
          "body": "Zm9v",
          "name": "foo.txt",
          "type": "text/plain",
        },
        "Base64 encodes the content"
      );
    });
});
