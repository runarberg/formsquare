import { contains, extendUniq, filter, flatMap } from "./utils.js";

// eslint-disable-next-line import/prefer-default-export
export function formElements(form) {
  if (form instanceof NodeList || Array.isArray(form)) {
    return flatMap(formElements, form);
  }

  const { elements } = form;

  if (
    !form.id ||
    (typeof window.HTMLFormControlsCollection === "function" &&
      elements instanceof window.HTMLFormControlsCollection)
  ) {
    return elements;
  }

  // Polyfill for browsers that don't support html5 form attribute.
  const outside = document.querySelectorAll(`[form="${form.id}"]`);
  const inside = filter(
    el => contains(el.getAttribute("form"), ["", null, form.id]),
    elements,
  );

  return extendUniq(inside, outside);
}
