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
    let {type, body} = splitDataURL(event.target.result);

    return {
      body,
      type,
      "name": file.name,
    };
  });
}

function splitDataURL(str) {
  const protocolIndex = str.indexOf(":");
  const mimeIndex = str.indexOf(";", protocolIndex);
  const startIndex = str.indexOf(",", mimeIndex);

  return {
    "type": str.slice(protocolIndex + 1, mimeIndex),
    "body": str.slice(startIndex + 1),
  };
}
