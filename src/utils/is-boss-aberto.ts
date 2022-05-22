import moment from "moment";

const isBossAberto = (horario: string, data: string): boolean => {
    if (!horario || !data) return false;
    
    data += '/' + new Date().getFullYear();

    const dataAtual = moment().utcOffset('GMT-03:00');
    const dataMorteBoss = moment(`${data} ${horario} -0300`, 'DD/MM/YYYY hh:mm Z');
    const dataNascimentoBossInicio = moment(dataMorteBoss).add(8, 'hours');

    return dataAtual.isAfter(dataNascimentoBossInicio);
}

export { isBossAberto }