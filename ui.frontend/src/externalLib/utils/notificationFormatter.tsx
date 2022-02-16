import { PrimeUserNotification } from "../models";
import moment from "moment";

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

export function modifyTimeDDMMYY(dateToModify: string, locale: string) {
    const local = new Date(dateToModify).toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric"
        
    });

    return local;
}

export function modifyTimeElapsed(dateToModify: string) {
    return moment(dateToModify, moment.ISO_8601).fromNow();
}

export {};