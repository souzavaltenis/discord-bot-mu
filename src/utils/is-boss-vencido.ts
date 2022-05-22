import moment from "moment";

const isBossVencido = (horario: string, data: string): boolean => {
    if (!horario || !data) return false;
    
    data += '/' + new Date().getFullYear();

    const dataAtual = moment().utcOffset('GMT-03:00');
    const dataMorteBoss = moment(`${data} ${horario}`, 'DD/MM/YYYY hh:mm').utcOffset('GMT-03:00');
    const dataNascimentoBossFim = moment(dataMorteBoss).add(12, 'hours');

    return dataAtual.isAfter(dataNascimentoBossFim);
}

export { isBossVencido }