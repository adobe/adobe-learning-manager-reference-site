/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
export const convertSecondsToTimeText = (time: number) => {
  if (!time || time === 0) {
    return "0 mins";
  }
  if (time === 1) {
    return `1 sec`;
  }
  if (time > 1 && time < 60) {
    return `${time} secs`;
  }
  if (time === 60) {
    return `1 min`;
  }
  if (time < 3600) {
    return `${Math.round(time / 60)} mins`;
  }
  const hours = Math.floor(time / 3600);
  const hoursText = hours === 1 ? "1 hr" : `${hours} hrs`;
  const mins = Math.round((time % 3600) / 60);
  const minsText = mins === 0 ? "" : mins === 1 ? "1 min" : `${mins} mins`;

  return `${hoursText} ${minsText}`;
};

export const timeSince = (date: any) => {
  var seconds = Math.floor(
    (new Date().valueOf() - new Date(date).valueOf()) / 1000
  );

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) === 1
      ? "1 Year"
      : Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? "1 month"
      : Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? "1 day"
      : Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? "1 hour"
      : Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? "1 minute"
      : Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) === 1
    ? "1 second"
    : Math.floor(interval) + " seconds";
};

export function modifyTime(dateToModify: string, locale: string) {
  if (isNaN(Date.parse(dateToModify))) {
    return "";
  }
  const date = new Date(dateToModify).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return date;
}

export function modifyTimeDDMMYY(dateToModify: string, locale: string) {
  if (isNaN(Date.parse(dateToModify))) {
    return "";
  }
  const local = new Date(dateToModify).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return local;
}

export function GetFormattedDate(dateStr: string, getUserLocale: string) {
  if (isNaN(Date.parse(dateStr))) {
    return "";
  }
  const date = new Date(dateStr);
  const dateTimeFormat = new Intl.DateTimeFormat(getUserLocale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  let month, day, year;
  dateTimeFormat.formatToParts(date).forEach((elem) => {
    if (elem.type === "month") {
      month = elem.value;
    } else if (elem.type === "day") {
      day = elem.value;
    } else if (elem.type === "year") {
      year = elem.value;
    }
  });
  //chinese needs space in between the characters
  if (getUserLocale === "zh-CN") {
    return `${year} 年 ${month} 月 ${day} 日`;
  } else if (getUserLocale === "ja-JP") {
    return `${year}年${month}月${day}日`;
  }
  return `${month} ${day}, ${year}`;
}