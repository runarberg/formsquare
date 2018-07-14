import { readFile } from "./files.js";
import { getPath, initialize } from "./path.js";
import { getWeek } from "./values.js";

import {
  any,
  contains,
  map,
  reduce,
  selectedValues,
  startsWith,
} from "./utils.js";

function getValue(input) {
  if (input.type === "select-multiple") {
    return selectedValues(input);
  }

  if (input.type === "number" || input.type === "range") {
    return Number.parseFloat(input.value);
  }

  if (
    contains(input.getAttribute("type"), ["date", "datetime-local", "month"])
  ) {
    const date = new Date(input.value);

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

function fillSparse(node, attr) {
  if (Array.isArray(node) && typeof attr === "number" && node.length < attr) {
    for (let i = node.length; i < attr; i += 1) {
      if (typeof node[i] === "undefined") {
        Object.assign(node, { [i]: null });
      }
    }
  }
}

function setLeaf(leaf, name, value, asObject) {
  const attr = name === -1 ? leaf.length : name;

  if (typeof leaf[attr] !== "undefined" && leaf[attr] !== null) {
    if (!Array.isArray(leaf[attr])) {
      Object.assign(leaf, { [attr]: [leaf[attr]] });
    }

    leaf[attr].push(asObject ? { "": value } : value);
  } else {
    fillSparse(leaf, attr);
    Object.assign(leaf, { [attr]: asObject ? { "": value } : value });
  }
}

function branch(path, node) {
  if (path.length <= 1) {
    return node;
  }

  const first = path[0];
  const rest = path.slice(1);
  const attr = first === -1 ? node.length : first;
  const next = node[attr];

  if (typeof next === "undefined") {
    const nextBranch = typeof rest[0] === "number" ? [] : Object.create(null);

    if (Array.isArray(node) && attr === -1) {
      node.push(nextBranch);
      return branch(rest, nextBranch);
    }
    fillSparse(node, attr);
    Object.assign(node, { [attr]: nextBranch });
  }

  return branch(rest, node[attr]);
}

function hasArrayLeaf(path) {
  return typeof path.slice(-1)[0] === "number";
}

function nonMember(obj, path) {
  // This is a non-member of an array.
  let node = obj;

  if (node === null) {
    // The array hasn't been initialized yet.
    if (path.length === 0 || typeof path[0] === "number") {
      return [];
    }

    // The array will go under a new branch.
    node = Object.create(null);
  }

  const leaf = branch(path, node);
  const attr = path.slice(-1)[0];

  if (
    path.length > 0 &&
    typeof leaf[attr] === "undefined" &&
    !hasArrayLeaf(path)
  ) {
    leaf[attr] = [];
  }

  return node;
}

export default function parse(elements) {
  function setValue(obj, input) {
    const { name, type } = input;
    let { value } = input;
    const path = getPath(name);

    if (type === "radio" && !input.checked) {
      // Do nothing.
      return obj;
    }
    if (type === "checkbox" && input.getAttribute("value") === null) {
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
        return [obj, value];
      }

      obj.push(value);

      return obj;
    }

    const tree = initialize(obj, path, value);
    const leaf = branch(path, tree);
    const attr = path.slice(-1)[0];
    const asObject =
      typeof attr !== "number" &&
      any(
        other =>
          startsWith(name, other.name) &&
          other !== input &&
          other.name.slice(name.length).match(/\[[^\]]\]/),
        elements,
      );

    setLeaf(leaf, attr, value, asObject);

    return tree;
  }

  return reduce(setValue, null, elements);
}
