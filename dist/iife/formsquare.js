var formsquare = (function () {
  'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  /* eslint no-use-before-define: ["error", { "functions": false }] */
  function all(p, arr) {
    var len = arr.length;

    for (var i = 0; i < len; i += 1) {
      if (!p(arr[i])) {
        return false;
      }
    }

    return true;
  }
  function allPass(ps) {
    return function (x) {
      return all(function (p) {
        return p(x);
      }, ps);
    };
  }
  function any(p, arr) {
    var len = arr.length;

    for (var i = 0; i < len; i += 1) {
      if (p(arr[i])) {
        return true;
      }
    }

    return false;
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
  function reduce(fn, init, arr) {
    var acc = init;
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

  function formElements(form) {
    if (form instanceof NodeList || Array.isArray(form)) {
      return flatMap(formElements, form);
    }

    var elements = form.elements;

    if (!form.id || typeof window.HTMLFormControlsCollection === "function" && elements instanceof window.HTMLFormControlsCollection) {
      return elements;
    } // Polyfill for browsers that don't support html5 form attribute.


    var outside = document.querySelectorAll("[form=\"".concat(form.id, "\"]"));
    var inside = filter(function (el) {
      return contains(el.getAttribute("form"), ["", null, form.id]);
    }, elements);
    return extendUniq(inside, outside);
  }

  function splitDataURL(str) {
    var protocolIndex = str.indexOf(":");
    var mimeIndex = str.indexOf(";", protocolIndex);
    var startIndex = str.indexOf(",", mimeIndex);
    return {
      type: str.slice(protocolIndex + 1, mimeIndex),
      body: str.slice(startIndex + 1)
    };
  } // eslint-disable-next-line import/prefer-default-export


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

  var DIGIT_RE = /^\s*\d+\s*$/;
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

  function getValue(input) {
    var maps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    if (input.type === "select-multiple") {
      return selectedValues(input);
    }

    if (input.type === "number" || input.type === "range") {
      return Number.parseFloat(input.value);
    }

    if (contains(input.getAttribute("type"), ["date", "datetime-local", "month"])) {
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

        return Promise.all(map(readFile, input.files));
      }

      return readFile(input.files[0]);
    }

    var value = input.value;
    maps.forEach(function (fn) {
      value = fn(value, input);
    });
    return value;
  }

  function fillSparse(node, attr) {
    if (Array.isArray(node) && typeof attr === "number" && node.length < attr) {
      for (var i = node.length; i < attr; i += 1) {
        if (typeof node[i] === "undefined") {
          Object.assign(node, _defineProperty({}, i, null));
        }
      }
    }
  }

  function setLeaf(leaf, name, value, asObject) {
    var attr = name === -1 ? leaf.length : name;

    if (typeof leaf[attr] !== "undefined" && leaf[attr] !== null) {
      if (!Array.isArray(leaf[attr])) {
        Object.assign(leaf, _defineProperty({}, attr, [leaf[attr]]));
      }

      leaf[attr].push(asObject ? {
        "": value
      } : value);
    } else {
      fillSparse(leaf, attr);
      Object.assign(leaf, _defineProperty({}, attr, asObject ? {
        "": value
      } : value));
    }
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
      }

      fillSparse(node, attr);
      Object.assign(node, _defineProperty({}, attr, nextBranch));
    }

    return branch(rest, node[attr]);
  }

  function hasArrayLeaf(path) {
    return typeof path.slice(-1)[0] === "number";
  }

  function nonMember(obj, path) {
    // This is a non-member of an array.
    var node = obj;

    if (node === null) {
      // The array hasn't been initialized yet.
      if (path.length === 0 || typeof path[0] === "number") {
        return [];
      } // The array will go under a new branch.


      node = Object.create(null);
    }

    var leaf = branch(path, node);
    var attr = path.slice(-1)[0];

    if (path.length > 0 && typeof leaf[attr] === "undefined" && !hasArrayLeaf(path)) {
      leaf[attr] = [];
    }

    return node;
  }

  function parse(elements, maps) {
    function setValue(obj, input) {
      var name = input.name,
          type = input.type;
      var value = input.value;
      var path = getPath(name);

      if (type === "radio" && !input.checked) {
        // Do nothing.
        return obj;
      }

      if (type === "checkbox" && input.getAttribute("value") === null) {
        value = input.checked;
      } else if (type === "checkbox" && !input.checked) {
        if (hasArrayLeaf(path) || any(function (other) {
          return other.name === name && other !== input;
        }, elements)) {
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

      var tree = initialize(obj, path);
      var leaf = branch(path, tree);
      var attr = path.slice(-1)[0];
      var asObject = typeof attr !== "number" && any(function (other) {
        return startsWith(name, other.name) && other !== input && other.name.slice(name.length).match(/\[[^\]]\]/);
      }, elements);
      setLeaf(leaf, attr, value, asObject);
      return tree;
    }

    return reduce(setValue, null, elements);
  }

  function newFormsquare() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$filters = _ref.filters,
        filters = _ref$filters === void 0 ? [] : _ref$filters,
        _ref$maps = _ref.maps,
        maps = _ref$maps === void 0 ? [] : _ref$maps;

    var formsquare = Object.create(null);
    Object.defineProperty(formsquare, "filter", {
      value: function value(p) {
        return newFormsquare({
          filters: [].concat(_toConsumableArray(filters), [p]),
          maps: maps
        });
      }
    });
    Object.defineProperty(formsquare, "map", {
      value: function value(p) {
        return newFormsquare({
          maps: [].concat(_toConsumableArray(maps), [p]),
          filters: filters
        });
      }
    });
    Object.defineProperty(formsquare, "parse", {
      value: function value(form) {
        var elements = filter(allPass(filters), formElements(form));
        return parse(elements, maps);
      }
    });
    return formsquare;
  }

  var formsquare = newFormsquare();

  return formsquare;

}());
//# sourceMappingURL=formsquare.js.map
