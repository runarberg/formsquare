(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.formsquare = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require("./lib/formsquare");

module.exports.NAME = "formsquare";
module.exports.VERSION = "0.7.0";

},{"./lib/formsquare":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readFile = readFile;
function readFile(file) {
  if (!file) {
    return Promise.resolve(null);
  }

  var reader = new FileReader();
  var loaded = new Promise(function (resolve, reject) {
    reader.addEventListener("load", resolve, false);
    reader.addEventListener("error", reject, false);
    reader.addEventListener("abort", reject, false);
  });

  reader.readAsDataURL(file);

  return loaded.then(function (event) {
    // data:text/plain;base64,Zm9vCg
    var _splitDataURL = splitDataURL(event.target.result),
        type = _splitDataURL.type,
        body = _splitDataURL.body;

    return {
      body: body,
      type: type,
      name: file.name
    };
  });
}

function splitDataURL(str) {
  var protocolIndex = str.indexOf(":");
  var mimeIndex = str.indexOf(";", protocolIndex);
  var startIndex = str.indexOf(",", mimeIndex);

  return {
    type: str.slice(protocolIndex + 1, mimeIndex),
    body: str.slice(startIndex + 1)
  };
}
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.formsquare = formsquare;

var _utils = require("./utils");

var _files = require("./files");

var digitRE = /^\s*\d+\s*$/;

function formsquare(form) {
  var includeEl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, _utils.constant)(true);

  if (typeof form === "function") {
    // Curry.
    return function (f) {
      return formsquare(f, form);
    };
  }

  var elements = (0, _utils.filter)(includeEl, formElements(form));

  return (0, _utils.reduce)(setValue, null, elements);

  function setValue(obj, input) {
    var name = input.name,
        type = input.type,
        value = input.value;

    var path = getPath(name);

    if (type === "radio" && !input.checked) {
      // Do nothing.
      return obj;
    } else if (type === "checkbox" && input.getAttribute("value") === null) {
      value = input.checked;
    } else if (type === "checkbox" && !input.checked) {
      if (hasArrayLeaf(path) || (0, _utils.any)(function (other) {
        return other.name === name && other !== input;
      }, elements)) {
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

    var leaf = branch(path, obj);
    var attr = path.slice(-1)[0];
    var asObject = typeof attr !== "number" && (0, _utils.any)(function (other) {
      return (0, _utils.startsWith)(name, other.name) && other !== input && other.name.slice(name.length).match(/\[[^\]]\]/);
    }, elements);

    setLeaf(leaf, attr, value, asObject);

    return obj;
  }
}

function getValue(input) {
  if (input.type === "select-multiple") {
    return (0, _utils.selectedValues)(input);
  }

  if (input.type === "number" || input.type === "range") {
    return +input.value;
  }

  if ((0, _utils.contains)(input.getAttribute("type"), ["date", "datetime-local", "month"])) {
    var date = new Date(input.value);

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

      return Promise.all((0, _utils.map)(_files.readFile, input.files));
    }

    return (0, _files.readFile)(input.files[0]);
  }

  return input.value;
}

function formElements(form) {
  if (form instanceof NodeList || Array.isArray(form)) {
    return (0, _utils.flatMap)(formElements, form);
  }

  var elements = form.elements;

  if (!form.id || typeof window.HTMLFormControlsCollection === "function" && elements instanceof window.HTMLFormControlsCollection) {
    return elements;
  }

  // Polyfill for browsers that don't support html5 form attribute.
  var outside = document.querySelectorAll("[form=\"" + form.id + "\"]");
  var inside = (0, _utils.filter)(function (el) {
    return (0, _utils.contains)(el.getAttribute("form"), ["", null, form.id]);
  }, elements);

  return (0, _utils.extendUniq)(inside, outside);
}

function initialize(obj, path) {
  if (obj === null) {
    return typeof path[0] === "number" ? [] : Object.create(null);
  }

  return obj;
}

function getPath(name) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  if (name.length === 0) {
    return path;
  }

  var open = name.indexOf("[");
  var close = name.indexOf("]");

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

  var next = name.slice(open + 1, close);
  var attr = next === "" ? -1 : next.match(digitRE) ? +next : next;

  path.push(attr);
  return getPath(name.slice(close + 1), path);
}

function branch(path, node) {
  if (path.length <= 1) {
    return node;
  }

  var first = path[0];
  var rest = path.slice(1);
  var attr = first === -1 ? node.length : first;
  var next = node[attr];

  if (typeof next === "undefined") {
    var nextBranch = typeof rest[0] === "number" ? [] : Object.create(null);

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
  var node = obj;

  if (node === null) {
    // The array hasn't been initialized yet.
    if (path.length === 0 || typeof path[0] === "number") {
      return [];
    }

    // The array will go under a new branch.
    node = Object.create(null);
  }

  var leaf = branch(path, node);
  var attr = path.slice(-1)[0];

  if (path.length > 0 && typeof leaf[attr] === "undefined" && !hasArrayLeaf(path)) {
    leaf[attr] = [];
  }

  return node;
}

function fillSparse(node, attr) {
  if (Array.isArray(node) && typeof attr === "number" && node.length < attr) {
    for (var i = node.length; i < attr; i += 1) {
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

  var _value$split = value.split("-W"),
      _value$split2 = _slicedToArray(_value$split, 2),
      year = _value$split2[0],
      week = _value$split2[1];

  year = parseInt(year, 10);
  week = parseInt(week, 10);

  if (week <= 0 || week > 53) {
    // Invalid week string.
    return value;
  }

  var naive = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  var dayOfWeek = naive.getUTCDay();
  var date = naive;

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

exports.default = formsquare;
},{"./files":2,"./utils":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.any = any;
exports.constant = constant;
exports.contains = contains;
exports.extendUniq = extendUniq;
exports.filter = filter;
exports.flatMap = flatMap;
exports.map = map;
exports.reduce = reduce;
exports.selectedValues = selectedValues;
exports.startsWith = startsWith;
function any(p, arr) {
  var len = arr.length;

  for (var i = 0; i < len; i += 1) {
    if (p(arr[i])) {
      return true;
    }
  }

  return false;
}

function constant(x) {
  return function () {
    return x;
  };
}

function contains(el, arr) {
  var len = arr.length;

  for (var i = 0; i < len; i += 1) {
    if (arr[i] === el) {
      return true;
    }
  }

  return false;
}

function extendUniq(a, b) {
  var len = b.length;

  for (var i = 0; i < len; i += 1) {
    if (!contains(b[i], a)) {
      a.push(b[i]);
    }
  }

  return a;
}

function filter(p, arr) {
  var filtered = [];
  var len = arr.length;

  for (var i = 0; i < len; i += 1) {
    if (p(arr[i])) {
      filtered.push(arr[i]);
    }
  }

  return filtered;
}

function flatMap(fn, arr) {
  return reduce(function (acc, el) {
    var collection = fn(el);
    var len = collection.length;

    for (var i = 0; i < len; i += 1) {
      acc.push(collection[i]);
    }

    return acc;
  }, [], arr);
}

function map(fn, arr) {
  var mapped = [];
  var len = arr.length;

  for (var i = 0; i < len; i += 1) {
    mapped.push(fn(arr[i]));
  }

  return mapped;
}

function reduce(fn, acc, arr) {
  var len = arr.length;

  for (var i = 0; i < len; i += 1) {
    acc = fn(acc, arr[i]);
  }

  return acc;
}

function selectedValues(select) {
  var options = select.selectedOptions || filter(function (option) {
    return option.selected;
  }, select.options);

  return map(function (option) {
    return option.value;
  }, options);
}

function startsWith(match, string) {
  return string.slice(0, match.length) === match;
}
},{}]},{},[1])(1)
});
