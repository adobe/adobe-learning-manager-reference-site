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
import { GetTranslationReplaced, GetTranslation } from "./translationService";

const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = 3600;
const DAY_IN_SECONDS = 86400;

export const convertSecondsToHourAndMinsText = (time: number) => {
  if (!time || time === 0) {
    return GetTranslationReplaced("alm.text.mins", "0");
  }
  if (time === 1) {
    return GetTranslation("alm.text.1sec");
  }
  if (time > 1 && time < MINUTE_IN_SECONDS) {
    return GetTranslationReplaced("alm.text.secs", `${time}`);
  }
  if (time === MINUTE_IN_SECONDS) {
    return GetTranslation("alm.text.1min");
  }
  if (time < HOUR_IN_SECONDS) {
    return time % MINUTE_IN_SECONDS == 0
      ? GetTranslationReplaced("alm.text.mins", `${Math.floor(time / MINUTE_IN_SECONDS)}`)
      : GetTranslationReplaced("alm.text.mins", `${Math.floor(time / MINUTE_IN_SECONDS)}`) +
          " " +
          GetTranslationReplaced("alm.text.secs", `${time % MINUTE_IN_SECONDS}`);
  }
  const hours = Math.floor(time / HOUR_IN_SECONDS);
  const hoursText =
    hours === 1
      ? GetTranslation("alm.text.1hr")
      : GetTranslationReplaced("alm.text.hrs", `${hours}`);
  const mins = Math.round((time % HOUR_IN_SECONDS) / MINUTE_IN_SECONDS);
  const minsText =
    mins === 0
      ? ""
      : mins === 1
        ? GetTranslation("alm.text.1min")
        : GetTranslationReplaced("alm.text.mins", `${mins}`);

  return `${hoursText} ${minsText}`;
};

// Time in hours mins seconds
export const calculateSecondsToTime = (time: number) => {
  if (!time || time === 0) {
    return GetTranslationReplaced("alm.text.mins", "0");
  }

  const hours = Math.floor(time / HOUR_IN_SECONDS);
  const mins = Math.floor((time % HOUR_IN_SECONDS) / MINUTE_IN_SECONDS);
  const secs = time % MINUTE_IN_SECONDS;

  const hoursText =
    hours > 0
      ? hours === 1
        ? GetTranslation("alm.text.1hr")
        : GetTranslationReplaced("alm.text.hrs", `${hours}`)
      : "";
  const minsText =
    mins > 0
      ? mins === 1
        ? GetTranslation("alm.text.1min")
        : GetTranslationReplaced("alm.text.mins", `${mins}`)
      : "";
  const secsText =
    secs > 0
      ? secs === 1
        ? GetTranslation("alm.text.1sec")
        : GetTranslationReplaced("alm.text.secs", `${secs}`)
      : "";

  const timeParts = [hoursText, minsText, secsText].filter(part => part !== ""); // Remove empty parts
  return timeParts.join(" ");
};

export const timeSince = (date: any) => {
  var seconds = Math.floor((new Date().valueOf() - new Date(date).valueOf()) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) === 1
      ? GetTranslation("alm.text.1year")
      : GetTranslationReplaced("alm.text.years", Math.floor(interval).toString());
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? GetTranslation("alm.text.1month")
      : GetTranslationReplaced("alm.text.months", Math.floor(interval).toString());
  }
  interval = seconds / DAY_IN_SECONDS;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? GetTranslation("alm.text.1day")
      : GetTranslationReplaced("alm.text.days", Math.floor(interval).toString());
  }
  interval = seconds / HOUR_IN_SECONDS;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? GetTranslation("alm.text.1hour")
      : GetTranslationReplaced("alm.text.hours", Math.floor(interval).toString());
  }
  interval = seconds / MINUTE_IN_SECONDS;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? GetTranslation("alm.text.1minute")
      : GetTranslationReplaced("alm.text.minutes", Math.floor(interval).toString());
  }
  return Math.floor(seconds) === 1
    ? GetTranslation("alm.text.1second")
    : GetTranslationReplaced("alm.text.seconds", Math.floor(interval).toString());
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

export function modifyTimeForSessionReminderNotif(dateToModify: string, locale: string) {
  if (isNaN(Date.parse(dateToModify))) {
    return "";
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };

  const formattedDate = new Date(dateToModify).toLocaleDateString(locale, dateOptions);
  const formattedTime = new Date(dateToModify).toLocaleTimeString(locale, timeOptions);

  // format: [Jan 22, 2024 1:00 PM]
  return `${formattedDate} ${formattedTime}`;
}

export function formatTime(dateString: string, locale: string) {
  const date = new Date(dateString);

  const time = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return time;
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
  dateTimeFormat.formatToParts(date).forEach(elem => {
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

export function getDateString(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

export function convertSecondsToTimeText(time: number) {
  if (!time || time === 0) {
    return GetTranslationReplaced("alm.text.mins", "0");
  }

  const timeUnits = [
    { unit: DAY_IN_SECONDS, type: "day" },
    { unit: HOUR_IN_SECONDS, type: "hr" },
    { unit: MINUTE_IN_SECONDS, type: "min" },
    { unit: 1, type: "sec" },
  ];

  let result = "";
  for (const { unit, type } of timeUnits) {
    if (time >= unit) {
      const value = Math.floor(time / unit);
      time -= value * unit;
      result += getDateText(value, type) + " ";
    }
  }

  return result.trim();
}

const getDateText = (time: number, type: string) => {
  return time > 0
    ? time === 1
      ? GetTranslation(`alm.text.1${type}`)
      : GetTranslationReplaced(`alm.text.${type}s`, `${time}`)
    : "";
};
