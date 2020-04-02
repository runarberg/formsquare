function splitDataURL(str) {
  const protocolIndex = str.indexOf(":");
  const mimeIndex = str.indexOf(";", protocolIndex);
  const startIndex = str.indexOf(",", mimeIndex);

  return {
    type: str.slice(protocolIndex + 1, mimeIndex),
    body: str.slice(startIndex + 1),
  };
}

// eslint-disable-next-line import/prefer-default-export
export function readFile(file) {
  if (!file) {
    return Promise.resolve(null);
  }

  const reader = new FileReader();
  const loaded = new Promise((resolve, reject) => {
    reader.addEventListener("load", resolve, false);
    reader.addEventListener("error", reject, false);
    reader.addEventListener("abort", reject, false);
  });

  reader.readAsDataURL(file);

  return loaded.then((event) => {
    // data:text/plain;base64,Zm9vCg
    const { type, body } = splitDataURL(event.target.result);

    return {
      body,
      type,
      name: file.name,
    };
  });
}
