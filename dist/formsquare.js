(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.formsquare = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require("./lib/formsquare");

module.exports.NAME = "formsquare";
module.exports.VERSION = "0.3.1";

},{"./lib/formsquare":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formsquare = formsquare;

var _utils = require("./utils");

var digitRE = /^\s*\d+\s*$/;

function formsquare(form) {
  var includeEl = arguments.length <= 1 || arguments[1] === undefined ? (0, _utils.constant)(true) : arguments[1];

  if (typeof form === "function") {
    // Curry.
    return function (f) {
      return formsquare(f, form);
    };
  }

  var elements = (0, _utils.filter)(includeEl, formElements(form));

  return (0, _utils.reduce)(setValue, null, elements);

  function setValue(obj, input) {
    var name = input.name;
    var value = input.value;
    var type = input.type;
    var path = getPath(name);

    if (type === "radio" && !input.checked) {
      // Do nothing.
      return obj;
    } else if (input.type === "select-multiple") {
      value = (0, _utils.selectedValues)(input);
    } else if (type === "number" || type === "range") {
      value = +value;
    } else if (type === "checkbox" && input.getAttribute("value") === null) {
      value = input.checked;
    } else if (type === "checkbox" && !input.checked) {
      if (hasArrayLeaf(path) || (0, _utils.any)(function (other) {
        return other.name === name && other !== input;
      }, elements)) {
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

    var leaf = branch(path, obj);
    var attr = path.slice(-1)[0];
    var asObject = typeof attr !== "number" && (0, _utils.any)(function (other) {
      return (0, _utils.startsWith)(name, other.name) && other !== input && other.name.slice(name.length).match(/\[[^\]]\]/);
    }, elements);

    setLeaf(leaf, attr, value, asObject);

    return obj;
  }
}

function formElements(form) {
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
  var path = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

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
  if (obj === null) {
    // The array hasn't been initialized yet.
    return [];
  }

  var leaf = branch(path, obj);
  var attr = path.slice(-1)[0];

  if (path.length > 0 && typeof leaf[attr] === "undefined" && !hasArrayLeaf(path)) {
    leaf[attr] = [];
  }

  return obj;
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

exports.default = formsquare;
},{"./utils":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.any = any;
exports.constant = constant;
exports.contains = contains;
exports.extendUniq = extendUniq;
exports.filter = filter;
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