import moment from "moment";

const dataNow = (): string => {
    return moment().utcOffset('GMT-03:00').format('HH:mm:ss DD/MM/YY');
}

export { dataNow }