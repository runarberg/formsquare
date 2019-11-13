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
  maps = [],
}: {
  filters?: Array<(HTMLElement) => boolean>,
  maps?: Array<(Function) => any>,
} = {}): Formsquare {
  const formsquare: any = Object.create(null);

  Object.defineProperty(formsquare, "filter", {
    value(p: HTMLElement => boolean): Formsquare {
      return newFormsquare({ filters: [...filters, p], maps });
    },
  });

  Object.defineProperty(formsquare, "map", {
    value(p: Function => any): Formsquare {
      return newFormsquare({ maps: [...maps, p], filters });
    },
  });

  Object.defineProperty(formsquare, "parse", {
    value(form: HTMLFormElement | Array<HTMLFormElement>): any {
      const elements = filter(allPass(filters), formElements(form));

      return parse(elements, maps);
    },
  });

  return formsquare;
}

export default newFormsquare();
