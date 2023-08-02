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
export const convertSecondsToTimeText = (time: number) => {
  if (!time || time === 0) {
    return GetTranslationReplaced("alm.text.mins","0");
  }
  if (time === 1) {
    return GetTranslation("alm.text.1sec");
  }
  if (time > 1 && time < 60) {
    return GetTranslationReplaced("alm.text.secs",`${time}`);
  }
  if (time === 60) {
    return GetTranslation("alm.text.1min");
  }
  if (time < 3600) {
    return (time % 60)==0 ? GetTranslationReplaced("alm.text.mins",`${Math.floor(time / 60)}`) : GetTranslationReplaced("alm.text.mins",`${Math.floor(time / 60)}`)+" "+GetTranslationReplaced("alm.text.secs",`${(time % 60)}`);
  }
  const hours = Math.floor(time / 3600);
  const hoursText = hours === 1 ? GetTranslation("alm.text.1hr") : GetTranslationReplaced("alm.text.hrs",`${hours}`);
  const mins = Math.round((time % 3600) / 60);
  const minsText = mins === 0 ? "" : mins === 1 ? GetTranslation("alm.text.1min") : GetTranslationReplaced("alm.text.mins",`${mins}`);

  return `${hoursText} ${minsText}`;
};

export const timeSince = (date: any) => {
  var seconds = Math.floor(
    (new Date().valueOf() - new Date(date).valueOf()) / 1000
  );

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) === 1
      ? GetTranslation("alm.text.1year")
      : GetTranslationReplaced("alm.text.years",(Math.floor(interval)).toString());
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? GetTranslation("alm.text.1month")
      : GetTranslationReplaced("alm.text.months",(Math.floor(interval)).toString());
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? GetTranslation("alm.text.1day")
      : GetTranslationReplaced("alm.text.days",(Math.floor(interval)).toString());
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? GetTranslation("alm.text.1hour")
      : GetTranslationReplaced("alm.text.hours",(Math.floor(interval)).toString());
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? GetTranslation("alm.text.1minute")
      : GetTranslationReplaced("alm.text.minutes",(Math.floor(interval)).toString());
  }
  return Math.floor(seconds) === 1
    ? GetTranslation("alm.text.1second")
    : GetTranslationReplaced("alm.text.seconds",(Math.floor(interval)).toString());
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

export function formatTime(dateString: string, locale: string){
    const date = new Date(dateString);

    const time =  date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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