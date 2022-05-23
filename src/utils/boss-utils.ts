import moment from "moment";
import { Boss } from "../models/boss";

const isBossAberto = (horario: string, data: string): boolean => {
    if (!horario || !data) return false;
    
    data += '/' + new Date().getFullYear();

    const dataAtual = moment().utcOffset('GMT-03:00');
    const dataMorteBoss = moment(`${data} ${horario} -0300`, 'DD/MM/YYYY hh:mm Z');
    const dataNascimentoBossInicio = moment(dataMorteBoss).add(8, 'hours');

    return dataAtual.isAfter(dataNascimentoBossInicio);
}

const isBossVencido = (horario: string, data: string): boolean => {
    if (!horario || !data) return false;
    
    data += '/' + new Date().getFullYear();

    const dataAtual = moment().utcOffset('GMT-03:00');
    const dataMorteBoss = moment(`${data} ${horario} -0300`, 'DD/MM/YYYY hh:mm Z');
    const dataNascimentoBossFim = moment(dataMorteBoss).add(12, 'hours');

    return dataAtual.isAfter(dataNascimentoBossFim);
}

const previsaoBoss = (horario: string): string => {
    if (!horario) return '';

    const maskHorario: string = 'HH:mm';

    const horarioNascimentoBossInicio = moment(horario, maskHorario).add(8, 'hours').format(maskHorario);
    const horarioNascimentoBossFim = moment(horario, maskHorario).add(12, 'hours').format(maskHorario);

    return `**[de ${horarioNascimentoBossInicio} até ${horarioNascimentoBossFim}]**`;
}

const ordernarListaBoss = (listaBoss: Boss[]): void => {
    listaBoss.sort(function(x: Boss, y: Boss) {
        if (x.id < y.id) {
          return -1;
        }

        if (x.id > y.id) {
          return 1;
        }
        return 0;
    });
}

const dataNowString = (pattern: string): string => {
    return moment().utcOffset('GMT-03:00').format(pattern);
}


export { isBossAberto, isBossVencido, previsaoBoss, ordernarListaBoss, dataNowString }