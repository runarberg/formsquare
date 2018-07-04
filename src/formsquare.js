import {
  any,
  constant,
  contains,
  extendUniq,
  filter,
  flatMap,
  map,
  reduce,
  selectedValues,
  startsWith,
} from "./utils";

import { readFile } from "./files";

const digitRE = /^\s*\d+\s*$/;

export function formsquare(form, includeEl = constant(true)) {
  if (typeof form === "function") {
    // Curry.
    return f => formsquare(f, form);
  }

  let elements = filter(includeEl, formElements(form));

  return reduce(setValue, null, elements);

  function setValue(obj, input) {
    let { name, type, value } = input;
    let path = getPath(name);

    if (type === "radio" && !input.checked) {
      // Do nothing.
      return obj;
    } else if (type === "checkbox" && input.getAttribute("value") === null) {
      value = input.checked;
    } else if (type === "checkbox" && !input.checked) {
      if (
        hasArrayLeaf(path) ||
        any(other => other.name === name && other !== input, elements)
      ) {
        return nonMember(obj, path);
      }
      value = null;
    } else {
      value = getValue(input);
    }

    if (path.length === 0) {
      if (obj === null) {
        // A singleton value
        return value;
      }

      if (!Array.isArray(obj)) {
        obj = [obj];
      }

      obj.push(value);

      return obj;
    }

    obj = initialize(obj, path, value);

    let leaf = branch(path, obj);
    let attr = path.slice(-1)[0];
    let asObject =
      typeof attr !== "number" &&
      any(
        other =>
          startsWith(name, other.name) &&
          other !== input &&
          other.name.slice(name.length).match(/\[[^\]]\]/),
        elements,
      );

    setLeaf(leaf, attr, value, asObject);

    return obj;
  }
}

function getValue(input) {
  if (input.type === "select-multiple") {
    return selectedValues(input);
  }

  if (input.type === "number" || input.type === "range") {
    return +input.value;
  }

  if (
    contains(input.getAttribute("type"), ["date", "datetime-local", "month"])
  ) {
    let date = new Date(input.value);

    if (date.toString() === "Invalid Date") {
      return input.value;
    }

    return date;
  }

  if (input.getAttribute("type") === "week") {
    return getWeek(input.value) || input.getAttribute("value");
  }

  if (input.type === "file") {
    if (input.multiple) {
      if (input.files.length === 0) {
        return Promise.resolve([]);
      }

      return Promise.all(map(readFile, input.files));
    }

    return readFile(input.files[0]);
  }

  return input.value;
}

function formElements(form) {
  if (form instanceof NodeList || Array.isArray(form)) {
    return flatMap(formElements, form);
  }

  let elements = form.elements;

  if (
    !form.id ||
    (typeof window.HTMLFormControlsCollection === "function" &&
      elements instanceof window.HTMLFormControlsCollection)
  ) {
    return elements;
  }

  // Polyfill for browsers that don't support html5 form attribute.
  let outside = document.querySelectorAll(`[form="${form.id}"]`);
  let inside = filter(
    el => contains(el.getAttribute("form"), ["", null, form.id]),
    elements,
  );

  return extendUniq(inside, outside);
}

function initialize(obj, path) {
  if (obj === null) {
    return typeof path[0] === "number" ? [] : Object.create(null);
  }

  return obj;
}

function getPath(name, path = []) {
  if (name.length === 0) {
    return path;
  }

  let open = name.indexOf("[");
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

  let next = name.slice(open + 1, close);
  let attr = next === "" ? -1 : next.match(digitRE) ? +next : next;

  path.push(attr);
  return getPath(name.slice(close + 1), path);
}

function branch(path, node) {
  if (path.length <= 1) {
    return node;
  }

  let first = path[0];
  let rest = path.slice(1);
  let attr = first === -1 ? node.length : first;
  let next = node[attr];

  if (typeof next === "undefined") {
    let nextBranch = typeof rest[0] === "number" ? [] : Object.create(null);

    if (Array.isArray(node) && attr === -1) {
      node.push(nextBranch);
      return branch(rest, nextBranch);
    } else {
      fillSparse(node, attr);
      node[attr] = nextBranch;
    }
  }

  return branch(rest, node[attr]);
}

function setLeaf(leaf, attr, value, asObject) {
  attr = attr === -1 ? leaf.length : attr;

  if (typeof leaf[attr] !== "undefined" && leaf[attr] !== null) {
    if (!Array.isArray(leaf[attr])) {
      leaf[attr] = [leaf[attr]];
    }
    leaf[attr].push(asObject ? { "": value } : value);
  } else {
    fillSparse(leaf, attr);
    leaf[attr] = asObject ? { "": value } : value;
  }
}

function nonMember(obj, path) {
  // This is a non-member of an array.
  if (obj === null) {
    // The array hasn't been initialized yet.
    return [];
  }

  let leaf = branch(path, obj);
  let attr = path.slice(-1)[0];

  if (
    path.length > 0 &&
    typeof leaf[attr] === "undefined" &&
    !hasArrayLeaf(path)
  ) {
    leaf[attr] = [];
  }

  return obj;
}

function fillSparse(node, attr) {
  if (Array.isArray(node) && typeof attr === "number" && node.length < attr) {
    for (let i = node.length; i < attr; i += 1) {
      if (typeof node[i] === "undefined") {
        node[i] = null;
      }
    }
  }
}

function hasArrayLeaf(path) {
  return typeof path.slice(-1)[0] === "number";
}

function getWeek(value) {
  // Get the date that starts this week.
  if (!value.match(/^\s*\d+\s*-W\s*\d+\s*$/)) {
    // Invalid week string.
    return value;
  }

  let [year, week] = value.split("-W");

  year = parseInt(year, 10);
  week = parseInt(week, 10);

  if (week <= 0 || week > 53) {
    // Invalid week string.
    return value;
  }

  let naive = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  let dayOfWeek = naive.getUTCDay();
  let date = naive;

  if (dayOfWeek <= 4) {
    date.setUTCDate(naive.getUTCDate() - naive.getUTCDay() + 1);
  } else {
    date.setUTCDate(naive.getUTCDate() + 8 - naive.getUTCDay());
  }

  if (date.toString() === "Invalid Date") {
    return value;
  }

  return date;
}

export default formsquare;
