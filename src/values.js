// eslint-disable-next-line import/prefer-default-export
export function getWeek(value) {
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
