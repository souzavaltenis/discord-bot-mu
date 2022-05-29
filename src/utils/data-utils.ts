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

export { 
    dataNowString,
    dataNowMoment,
    momentToString,
    stringToMoment,
    diffDatas,
    distanceDatasInMinutes
}