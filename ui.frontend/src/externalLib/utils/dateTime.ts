import { METHODS } from "http";

export const convertSecondsToTimeText = (time: number) => {

  if (!time || time == 0) {
    return "0 mins";
  }
  if (time == 1) {
    return `1 sec`;
  }
  if (time > 1 && time < 60) {
    return `${time} secs`;
  }
  if (time == 60) {
    return `1 min`;
  }
  if (time < 3600) {
    return `${Math.round(time / 60)} mins`;
  }
  const hours = Math.floor(time / 3600);
  const hoursText = hours == 1 ? "1 hr" : `${hours} hrs`;
  const mins = Math.round((time % 3600) / 60);
  const minsText = mins == 0 ? "" : mins == 1 ? "1 min" : `${mins} mins`;

  return `${hoursText} ${minsText}`;
}


export const timeSince = (date: any) => {

  var seconds = Math.floor((new Date().valueOf() - new Date(date).valueOf()) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) == 1 ? "1 Year" : Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) == 1 ? "1 month" : Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) == 1 ? "1 day" : Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) == 1 ? "1 hour" : Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) == 1 ? "1 minute" : Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) == 1 ? "1 second" : Math.floor(interval) + " seconds";
}


export function modifyTime(dateToModify: string, locale: string) {
  const local = new Date(dateToModify).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return local;
}
const DEFAULT_DATE_OPTIONS: any = {
  year: 'numeric', month: 'short', day: 'numeric'
}
export function dateBasedOnLocale(date: string, locale: string, options: any = {}) {
  const dateOptions = { ...DEFAULT_DATE_OPTIONS, options }
  return new Date(date).toLocaleDateString(locale, dateOptions);
}
