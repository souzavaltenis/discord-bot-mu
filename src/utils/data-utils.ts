import moment, { Moment } from "moment";

const dataNowString = (pattern: string = 'HH:mm:ss'): string => {
    return moment().utcOffset('GMT-03:00').format(pattern);
}

const dataNowMoment = (startOfDay?: boolean): Moment => {
    return startOfDay ? moment().startOf('day').utcOffset('GMT-03:00') : moment().utcOffset('GMT-03:00');
}

const momentToString = (m: Moment): string => {
    return m.isValid() ? m.format('DD/MM/YYYY HH:mm Z') : '';
}

const stringToMoment = (str: string, pattern: string = 'DD/MM/YYYY HH:mm Z'): Moment => {
    return str ? moment(str, pattern).utcOffset('GMT-03:00') : moment(null);
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

const distanceDatasInDays = (x: Moment, y: Moment): number => {
    const diff = x.diff(y);
    return ~~moment.duration(diff).asDays();
}

const formatTimestamp = (timestamp: number): string => {
    let textTimestamp: string = '';
    
    const duration = moment.duration(timestamp);
    
    const days = ~~duration.asDays();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    if (days > 0)
        textTimestamp += days + 'd ';

    if (hours > 0 || days > 0)
        textTimestamp += hours + 'h ';
    
    if (minutes > 0 || hours > 0 || days > 0)
        textTimestamp += minutes + 'm ';

    if (seconds > 0)
        textTimestamp += seconds + 's';

    return textTimestamp;
}

const distanceDatasString = (x: Moment, y: Moment): string => {
    const diff = x.diff(y);
    return formatTimestamp(diff);
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

const millisecondsToMidnight = (): number => {
    return dataNowMoment().endOf('day').valueOf() - dataNowMoment().valueOf();
}

export { 
    dataNowString,
    dataNowMoment,
    momentToString,
    stringToMoment,
    diffDatas,
    distanceDatasInMinutes,
    distanceDatasInHours,
    distanceDatasInDays,
    timestampToMoment,
    isSameMoment,
    millisecondsToNextHour,
    distanceDatasString,
    formatTimestamp,
    millisecondsToMidnight
}