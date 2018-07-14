const DIGIT_RE = /^\s*\d+\s*$/;

export function initialize(obj, path) {
  if (obj === null) {
    return typeof path[0] === "number" ? [] : Object.create(null);
  }

  return obj;
}

export function getPath(name, path = []) {
  if (name.length === 0) {
    return path;
  }

  const open = name.indexOf("[");
  let close = name.indexOf("]");

  if (open <= 0 && close === -1) {
    path.push(name);

    return path;
  }

  while (close < open && close !== -1) {
    close = name.slice(close).indexOf("]");
  }

  if (close === -1) {
    path.push(name);
    return path;
  }

  if (open > 0) {
    path.push(name.slice(0, open));
    return getPath(name.slice(open), path);
  }

  const next = name.slice(open + 1, close);

  if (next === "") {
    path.push(-1);
  } else if (next.match(DIGIT_RE)) {
    path.push(Number.parseInt(next, 10));
  } else {
    path.push(next);
  }

  return getPath(name.slice(close + 1), path);
}
