/* eslint no-use-before-define: ["error", { "functions": false }] */

export function all(p, arr) {
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    if (!p(arr[i])) {
      return false;
    }
  }

  return true;
}

export function allPass(ps) {
  return (x) => all((p) => p(x), ps);
}

export function any(p, arr) {
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    if (p(arr[i])) {
      return true;
    }
  }

  return false;
}

export function contains(el, arr) {
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    if (arr[i] === el) {
      return true;
    }
  }

  return false;
}

export function extendUniq(a, b) {
  const len = b.length;

  for (let i = 0; i < len; i += 1) {
    if (!contains(b[i], a)) {
      a.push(b[i]);
    }
  }

  return a;
}

export function filter(p, arr) {
  const filtered = [];
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    if (p(arr[i])) {
      filtered.push(arr[i]);
    }
  }

  return filtered;
}

export function flatMap(fn, arr) {
  return reduce(
    (acc, el) => {
      const collection = fn(el);
      const len = collection.length;

      for (let i = 0; i < len; i += 1) {
        acc.push(collection[i]);
      }

      return acc;
    },
    [],
    arr,
  );
}

export function isObject(value) {
  if (!value) {
    return false;
  }

  if (
    value instanceof Date ||
    value instanceof Promise ||
    Array.isArray(value)
  ) {
    return false;
  }

  const type = typeof value;

  return (
    type !== "bigint" &&
    type !== "boolean" &&
    type !== "number" &&
    type !== "string" &&
    type !== "symbol"
  );
}

export function map(fn, arr) {
  const mapped = [];
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    mapped.push(fn(arr[i]));
  }

  return mapped;
}

export function reduce(fn, init, arr) {
  let acc = init;
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    acc = fn(acc, arr[i]);
  }

  return acc;
}

export function selectedValues(select) {
  const options =
    select.selectedOptions ||
    filter((option) => option.selected, select.options);

  return map((option) => option.value, options);
}

export function startsWith(match, string) {
  return string.slice(0, match.length) === match;
}
