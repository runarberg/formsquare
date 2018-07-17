// @flow

import { formElements } from "./elements.js";
import parse from "./parser.js";

import { allPass, filter } from "./utils.js";

interface Formsquare {
  filter((HTMLElement) => boolean): Formsquare;
  parse(HTMLFormElement | Array<HTMLFormElement>): any;
}

function newFormsquare({
  filters = [],
}: {
  filters?: Array<(HTMLElement) => boolean>,
} = {}): Formsquare {
  const formsquare: any = Object.create(null);

  Object.defineProperty(formsquare, "filter", {
    value(p: HTMLElement => boolean): Formsquare {
      return newFormsquare({ filters: [...filters, p] });
    },
  });

  Object.defineProperty(formsquare, "parse", {
    value(form: HTMLFormElement | Array<HTMLFormElement>): any {
      const elements = filter(allPass(filters), formElements(form));

      return parse(elements);
    },
  });

  return formsquare;
}

export default newFormsquare();
