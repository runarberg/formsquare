import {any, concat, contains, filter, reduce} from "ramda";
import {asArray, constant, selected, startsWith} from "./utils";


const digitRE = /^\s*\d+\s*$/;

export function formsquare(form, includeEl=constant(true)) {
  if (typeof form === "function") {
    // Curry.
    return (f) => formsquare(f, form);
  }

  let elements = filter(includeEl, formElements(form));

  return reduce(setValue, null, elements);

  function setValue(obj, input) {
    let name = input.name;
    let value = input.value;
    let type = input.type;
    let path = getPath(name);

    if (type === "radio" && !input.checked) {
      // Do nothing.
      return obj;
    } else if (input.type === "select-multiple") {
      value = selected(input);
    } else if (type === "number" || type === "range") {
      value = +value;
    } else if (type === "checkbox" && input.getAttribute("value") === null) {
      value = input.checked;
    } else if (type === "checkbox" && !input.checked) {
      if (hasArrayLeaf(path) || any(
        (other) => other.name === name && other !== input,
        elements
      )) {
        return nonMember(obj, path);
      }
      value = null;
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
    let asObject = typeof attr !== "number" && any(
      (other) => startsWith(name, other.name) &&
        other !== input &&
        other.name.slice(name.length).match(/\[[^\]]\]/),
      elements
    );

    setLeaf(leaf, attr, value, asObject);

    return obj;
  }
}

function formElements(form) {
  let elements = form.elements;

  if (
    !form.id ||
      typeof window.HTMLFormControlsCollection === "function" &&
      elements instanceof window.HTMLFormControlsCollection
  ) {
    return asArray(elements);
  }

  // Polyfill for browsers that don't support html5 form attribute.
  let outside = document.querySelectorAll(`[form="${form.id}"]`);
  let inside = filter(
    (el) => contains(el.getAttribute("form"), ["", null, form.id]),
    asArray(elements)
  );

  return concat(inside, asArray(outside));
}

function initialize(obj, path) {
  if (obj === null) {
    return typeof path[0] === "number" ?
      [] :
      Object.create(null);
  }

  return obj;
}

function getPath(name, path=[]) {
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
  let attr = next === "" ? -1 :
      next.match(digitRE) ? +next :
      next;

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
    let nextBranch = typeof rest[0] === "number" ?
          [] :
          Object.create(null);

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
    leaf[attr].push(asObject ? {"": value} : value);
  } else {
    fillSparse(leaf, attr);
    leaf[attr] = asObject ? {"": value} : value;
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

  if (path.length > 0 && typeof leaf[attr] === "undefined" && !hasArrayLeaf(path)) {
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

export default formsquare;
