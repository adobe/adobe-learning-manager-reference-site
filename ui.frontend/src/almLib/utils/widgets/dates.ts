export const ONE_SEC = 1000;
export const ONE_MIN = 60 * ONE_SEC;
export const ONE_HOUR = 60 * ONE_MIN;
export const ONE_DAY = 24 * ONE_HOUR;

export const msToDays = (ms: number) => {
  return Math.floor(ms / ONE_DAY);
};

export const msToHours = (ms: number) => {
  return Math.floor(ms / ONE_HOUR);
};

export const isAfter = (date1: string | Date | number, date2: string | Date | number) => {
  date1 = new Date(date1);
  date2 = new Date(date2);
  return date1 > date2;
};

export const add = (date: string | Date | number, timeToAdd: number, unit?: any) => {
  const dateInMs = new Date(date).getTime();
  switch (unit) {
    case "d":
      timeToAdd = timeToAdd * ONE_DAY;
      break;
  }
  const updatedDate = dateInMs + timeToAdd;
  return new Date(updatedDate);
};

export const diffBetweenDates = (
  date1: string | Date | number,
  date2: string | Date | number,
  diffUnit?: any
) => {
  date1 = new Date(date1);
  date2 = new Date(date2);
  const diffInMs = date2.getTime() - date1.getTime();
  switch (diffUnit) {
    case "h":
      return msToHours(diffInMs);
    case "d":
      return msToDays(diffInMs);
    default:
      return diffInMs;
  }
};
