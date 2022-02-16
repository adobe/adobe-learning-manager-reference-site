export const convertSecondsToTimeText = (time: number)  => {

    if(!time || time == 0) {
        return "0 mins";
    } 
    if(time == 1) {
        return `1 sec`;
    }
    if(time > 1 && time < 60) {
        return `${time} secs`;
    }
    if(time == 60) {
        return `1 min`; 
    }
    if(time < 3600) {
        return `${Math.round(time/60)} mins`;
    }
    const hours = Math.floor(time/3600); 
    const hoursText = hours == 1 ? "1 hr" : `${hours} hrs`;
    const mins = Math.round((time%3600)/60);
    const minsText = mins == 0 ? "" : mins == 1 ? "1 min" : `${mins} mins`;

    return `${hoursText} ${minsText}`;
}