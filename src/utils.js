export function asArray(elements) {
  if (Array.from) {
    return Array.from(elements);
  } else {
    let arr = [];

    for (let i = 0; i < elements.length; i += 1) {
      arr.push(elements[i]);
    }

    return arr;
  }
}

export function startsWith(match, string) {
  return string.slice(0, match.length) === match;
}


