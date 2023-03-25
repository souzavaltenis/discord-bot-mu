import moment, { Moment } from "moment";

const dataNowString = (pattern: string): string => {
    return moment().utcOffset('GMT-03:00').format(pattern);
}

const dataNowMoment = (): Moment => {
    return moment().utcOffset('GMT-03:00');
}

const momentToString = (m: Moment): string => {
    return m.isValid() ? m.format('DD/MM/YYYY HH:mm Z') : '';
}

const stringToMoment = (str: string): Moment => {
    return str ? moment(str, 'DD/MM/YYYY HH:mm Z').utcOffset('GMT-03:00') : moment(null);
}

const diffDatas = (x: Moment, y: Moment): Moment => {
    const diff = x.diff(y);
    return diff > 0 ? moment.utc(diff) : moment(null);
}

const distanceDatasInMinutes = (x: Moment, y: Moment): number => {
    const diff = x.diff(y);
    return moment.duration(diff).asMinutes();
}

const distanceDatasInHours = (x: Moment, y: Moment): number => {
    const diff = x.diff(y);
    return moment.duration(diff).asHours();
}

const distanceDatasString = (x: Moment, y: Moment): string => {
    const diff = x.diff(y);
    const duration = moment.duration(diff);

    let textDistance: string = '';

    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    if (days > 0)
        textDistance += days + 'd ';

    if (hours > 0 || days > 0)
        textDistance += hours + 'h ';
    
    if (minutes > 0 || hours > 0 || days > 0)
        textDistance += minutes + 'm ';

    if (seconds > 0 || minutes > 0 || hours > 0 || days > 0)
        textDistance += seconds + 's';

    return textDistance;
}

const timestampToMoment = (timestamp: number): Moment => {
    return moment.utc(timestamp).utcOffset('GMT-03:00');
}

const isSameMoment = (now: Moment, timestamp: number, type: string): boolean => {
    const input = timestampToMoment(timestamp);

    switch(type) {
        case 'day': return now.isSame(input, 'day');
        case 'week': return now.isoWeek() == input.isoWeek() && now.isSame(input, 'year');
        case 'month': return now.isSame(input, 'month');
        default: return false;
    }
}

const millisecondsToNextHour = (): number => {
    return (60 - dataNowMoment().minutes()) * 60 * 1000;
}

export { 
    dataNowString,
    dataNowMoment,
    momentToString,
    stringToMoment,
    diffDatas,
    distanceDatasInMinutes,
    distanceDatasInHours,
    timestampToMoment,
    isSameMoment,
    millisecondsToNextHour,
    distanceDatasString
}