import { formElements } from "./elements.js";
import parse from "./parser.js";

import { constant, filter } from "./utils.js";

export default function formsquare(form, includeEl = constant(true)) {
  if (typeof form === "function") {
    // Curry.
    return f => formsquare(f, form);
  }

  const elements = filter(includeEl, formElements(form));

  return parse(elements);
}
