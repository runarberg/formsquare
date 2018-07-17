import browserEnv from "browser-env";

import formsquare from "../src/module.js";

browserEnv(["window", "document", "NodeList"]);

export function crel(tagName, attributes = {}, children = []) {
  const el = document.createElement(tagName);

  if (Array.isArray(attributes)) {
    return crel(tagName, {}, attributes);
  }

  Object.keys(attributes).forEach(attr =>
    el.setAttribute(attr, attributes[attr]),
  );

  children.forEach(child =>
    el.appendChild(typeof child === "string" ? crel(child) : child),
  );

  return el;
}

export function text(str) {
  return document.createTextNode(str);
}

export function input(attributes = {}) {
  return crel("input", attributes);
}

export function checkbox(attributes = {}) {
  const el = input(attributes);

  el.type = "checkbox";

  return el;
}

export function textarea(attributes, content) {
  if (typeof attributes === "string") {
    return textarea({}, attributes);
  }

  return crel("textarea", attributes, [text(content)]);
}

export function select(attributes = {}, options = []) {
  return crel("select", attributes, options);
}

export function option(attributes, content) {
  if (typeof attributes === "string") {
    return option({}, attributes);
  }

  return crel("option", attributes, [text(content)]);
}

export function form(attributes = {}, inputs = []) {
  return crel("form", attributes, inputs);
}

export function tform(inputs) {
  return formsquare.parse(form(inputs));
}
