export function any(p, arr) {
  let len = arr.length;

  for (let i = 0; i < len; i += 1) {
    if (p(arr[i])) {
      return true;
    }
  }

  return false;
}

export function constant(x) {
  return () => x;
}

export function contains(el, arr) {
  let len = arr.length;

  for (let i = 0; i < len; i += 1) {
    if (arr[i] === el) {
      return true;
    }
  }

  return false;
}

export function extendUniq(a, b) {
  let len = b.length;

  for (let i = 0; i < len; i += 1) {
    if (!contains(b[i], a)) {
      a.push(b[i]);
    }
  }

  return a;
}

export function filter(p, arr) {
  let filtered = [];
  let len = arr.length;

  for (let i = 0; i < len; i += 1) {
    if (p(arr[i])) {
      filtered.push(arr[i]);
    }
  }

  return filtered;
}

function map(fn, arr) {
  let mapped = [];
  let len = arr.length;

  for (let i = 0; i < len; i += 1) {
    mapped.push(fn(arr[i]));
  }

  return mapped;
}

export function reduce(fn, acc, arr) {
  let len = arr.length;

  for (let i = 0; i < len; i += 1) {
    acc = fn(acc, arr[i]);
  }

  return acc;
}

export function selectedValues(select) {
  let options = select.selectedOptions ||
        filter((option) => option.selected, select.options);

  return map((option) => option.value, options);
}

export function startsWith(match, string) {
  return string.slice(0, match.length) === match;
}
