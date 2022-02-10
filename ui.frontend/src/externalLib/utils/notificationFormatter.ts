import { PrimeUserNotification } from "../models/";

const feedbackChannels: Array<string> = [
    "course::l1FeedbackPrompt",
    "learningProgram::l1Feedback",
];

function modifyTime(dateToModify: string, locale: string) {
    const local = new Date(dateToModify).toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return local;
}

export function getNotificationAsAstring(
    notif: PrimeUserNotification,
    locale: string
): string {
    let message = notif.message;
    let name1 = -1,
        name0 = -1,
        endname0 = -1,
        endname1 = -1;
    let msg = "";
    if (message.includes("{{{name1}}}") || message.includes("{{name1}}")) {
        if (feedbackChannels.includes(notif.channel)) {
            message = message.replace("\n{{{name1}}}", "");
            message = message.replace("\n{{name1}}", "");
        } else {
            name1 = message.indexOf("{{{name1}}}");
            endname1 = name1 + 11;
            if (name1 < 0) {
                name1 = message.indexOf("{{name1}}");
                endname1 = name1 + 9;
            }
        }
    }
    if (message.includes("{{{name0}}}") || message.includes("{{name0}}")) {
        name0 = message.indexOf("{{{name0}}}");
        endname0 = name0 + 11;
        if (name0 < 0) {
            name0 = message.indexOf("{{name0}}");
            endname0 = name0 + 9;
        }
    }
    if (name1 > name0 || name1 === -1) {
        const x = name0 > 0 ? message.substring(0, name0) : null;
        const y = message.substring(
            endname0,
            name1 > 0 ? name1 : message.length
        );
        const z =
            name1 !== -1 ? message.substring(endname1, message.length) : "";
        msg = `${x} ${
            ["date", "time"].includes(notif.modelTypes[0])
                ? modifyTime(notif.modelNames[0], locale)
                : notif.modelNames[0]
        } ${y} ${
            name1 > 0
                ? ["date", "time"].includes(notif.modelTypes[1])
                    ? modifyTime(notif.modelNames[1], locale)
                    : notif.modelNames[1]
                : ""
        }${z}`;
    } else {
        const x = name1 > 0 ? message.substring(0, name1) : "";
        const y = message.substring(
            endname1,
            name0 > 0 ? name0 : message.length
        );
        const z =
            name0 !== -1 ? message.substring(endname0, message.length) : "";
        msg = `${x}
        ${
            ["date", "time"].includes(notif.modelTypes[1])
                ? modifyTime(notif.modelNames[1], locale)
                : notif.modelNames[1]
        }
        ${y}${
            name0 > 0
                ? ["date", "time"].includes(notif.modelTypes[0])
                    ? modifyTime(notif.modelNames[0], locale)
                    : notif.modelNames[0]
                : ""
        }${z}`;
    }
    return msg;
}
export {};