export function readFile(file) {
  if (!file) {
    return Promise.resolve(null);
  }

  let reader = new FileReader();
  let loaded = new Promise((resolve, reject) => {
    reader.addEventListener("load", resolve, false);
    reader.addEventListener("error", reject, false);
    reader.addEventListener("abort", reject, false);
  });

  reader.readAsDataURL(file);

  return loaded.then((event) => {
    // data:text/plain;base64,Zm9vCg
    let [type, body] = event.target.result.split(";");

    return {
      "body": body.slice(7),
      "name": file.name,
      "type": type.slice(5),
    };
  });
}
