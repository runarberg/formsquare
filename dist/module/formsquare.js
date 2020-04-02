/* eslint no-use-before-define: ["error", { "functions": false }] */
function all(p, arr) {
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    if (!p(arr[i])) {
      return false;
    }
  }

  return true;
}
function allPass(ps) {
  return x => all(p => p(x), ps);
}
function any(p, arr) {
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    if (p(arr[i])) {
      return true;
    }
  }

  return false;
}
function contains(el, arr) {
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    if (arr[i] === el) {
      return true;
    }
  }

  return false;
}
function extendUniq(a, b) {
  const len = b.length;

  for (let i = 0; i < len; i += 1) {
    if (!contains(b[i], a)) {
      a.push(b[i]);
    }
  }

  return a;
}
function filter(p, arr) {
  const filtered = [];
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    if (p(arr[i])) {
      filtered.push(arr[i]);
    }
  }

  return filtered;
}
function flatMap(fn, arr) {
  return reduce((acc, el) => {
    const collection = fn(el);
    const len = collection.length;

    for (let i = 0; i < len; i += 1) {
      acc.push(collection[i]);
    }

    return acc;
  }, [], arr);
}
function map(fn, arr) {
  const mapped = [];
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    mapped.push(fn(arr[i]));
  }

  return mapped;
}
function reduce(fn, init, arr) {
  let acc = init;
  const len = arr.length;

  for (let i = 0; i < len; i += 1) {
    acc = fn(acc, arr[i]);
  }

  return acc;
}
function selectedValues(select) {
  const options = select.selectedOptions || filter(option => option.selected, select.options);
  return map(option => option.value, options);
}
function startsWith(match, string) {
  return string.slice(0, match.length) === match;
}

function formElements(form) {
  if (form instanceof NodeList || Array.isArray(form)) {
    return flatMap(formElements, form);
  }

  const {
    elements
  } = form;

  if (!form.id || typeof window.HTMLFormControlsCollection === "function" && elements instanceof window.HTMLFormControlsCollection) {
    return elements;
  } // Polyfill for browsers that don't support html5 form attribute.


  const outside = document.querySelectorAll(`[form="${form.id}"]`);
  const inside = filter(el => contains(el.getAttribute("form"), ["", null, form.id]), elements);
  return extendUniq(inside, outside);
}

function splitDataURL(str) {
  const protocolIndex = str.indexOf(":");
  const mimeIndex = str.indexOf(";", protocolIndex);
  const startIndex = str.indexOf(",", mimeIndex);
  return {
    type: str.slice(protocolIndex + 1, mimeIndex),
    body: str.slice(startIndex + 1)
  };
} // eslint-disable-next-line import/prefer-default-export


function readFile(file) {
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
  return loaded.then(event => {
    // data:text/plain;base64,Zm9vCg
    const {
      type,
      body
    } = splitDataURL(event.target.result);
    return {
      body,
      type,
      name: file.name
    };
  });
}

const DIGIT_RE = /^\s*\d+\s*$/;
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

// eslint-disable-next-line import/prefer-default-export
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

  const naive = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dayOfWeek = naive.getUTCDay();
  const date = naive;

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

function getValue(input, maps = []) {
  if (input.type === "select-multiple") {
    return selectedValues(input);
  }

  if (input.type === "number" || input.type === "range") {
    return Number.parseFloat(input.value);
  }

  if (contains(input.getAttribute("type"), ["date", "datetime-local", "month"])) {
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

  let {
    value
  } = input;
  maps.forEach(fn => {
    value = fn(value, input);
  });
  return value;
}

function fillSparse(node, attr) {
  if (Array.isArray(node) && typeof attr === "number" && node.length < attr) {
    for (let i = node.length; i < attr; i += 1) {
      if (typeof node[i] === "undefined") {
        Object.assign(node, {
          [i]: null
        });
      }
    }
  }
}

function setLeaf(leaf, name, value, asObject) {
  const attr = name === -1 ? leaf.length : name;

  if (typeof leaf[attr] !== "undefined" && leaf[attr] !== null) {
    if (!Array.isArray(leaf[attr])) {
      Object.assign(leaf, {
        [attr]: [leaf[attr]]
      });
    }

    leaf[attr].push(asObject ? {
      "": value
    } : value);
  } else {
    fillSparse(leaf, attr);
    Object.assign(leaf, {
      [attr]: asObject ? {
        "": value
      } : value
    });
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
    Object.assign(node, {
      [attr]: nextBranch
    });
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
    } // The array will go under a new branch.


    node = Object.create(null);
  }

  const leaf = branch(path, node);
  const attr = path.slice(-1)[0];

  if (path.length > 0 && typeof leaf[attr] === "undefined" && !hasArrayLeaf(path)) {
    leaf[attr] = [];
  }

  return node;
}

function parse(elements, maps) {
  function setValue(obj, input) {
    const {
      name,
      type
    } = input;
    let {
      value
    } = input;
    const path = getPath(name);

    if (type === "radio" && !input.checked) {
      // Do nothing.
      return obj;
    }

    if (type === "checkbox" && input.getAttribute("value") === null) {
      value = input.checked;
    } else if (type === "checkbox" && !input.checked) {
      if (hasArrayLeaf(path) || any(other => other.name === name && other !== input, elements)) {
        return nonMember(obj, path);
      }

      value = null;
    } else {
      value = getValue(input, maps);
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

    const tree = initialize(obj, path);
    const leaf = branch(path, tree);
    const attr = path.slice(-1)[0];
    const asObject = typeof attr !== "number" && any(other => startsWith(name, other.name) && other !== input && other.name.slice(name.length).match(/\[[^\]]\]/), elements);
    setLeaf(leaf, attr, value, asObject);
    return tree;
  }

  return reduce(setValue, null, elements);
}

function newFormsquare({
  filters = [],
  maps = []
} = {}) {
  const formsquare = Object.create(null);
  Object.defineProperty(formsquare, "filter", {
    value(p) {
      return newFormsquare({
        filters: [...filters, p],
        maps
      });
    }

  });
  Object.defineProperty(formsquare, "map", {
    value(p) {
      return newFormsquare({
        maps: [...maps, p],
        filters
      });
    }

  });
  Object.defineProperty(formsquare, "parse", {
    value(form) {
      const elements = filter(allPass(filters), formElements(form));
      return parse(elements, maps);
    }

  });
  return formsquare;
}

var formsquare = newFormsquare();

export default formsquare;
