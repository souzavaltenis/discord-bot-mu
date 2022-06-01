/* eslint-disable @typescript-eslint/no-non-null-assertion */
import moment, { Moment } from "moment";
import { Boss } from "../models/boss";
import { tracos } from "./geral-utils";
import { config } from '../config/get-configs';
import { bold, spoiler, strikethrough } from "@discordjs/builders";
import { dataNowMoment, diffDatas } from "./data-utils";
import { SalaBoss } from "../models/sala-boss";

const formatBoss = (boss: Boss): string => {
    let infoBoss: string = tracos(55) + '\n';

    boss.salas.forEach((horario: Moment, sala: number) => {
        infoBoss += `${bold(`Sala ${sala}`)}: ${formatLinhaInfo(horario)}\n`;
    });

    return infoBoss + '\u200B\n';
};

const formatSalaBoss = (bossSalas: SalaBoss[]) => {
    let infoSala: string = tracos(62) + '\n';

    bossSalas.forEach((salaBoss: SalaBoss) => {
        infoSala += `${bold(`${salaBoss.nomeBoss}`)}: ${formatLinhaInfo(salaBoss.horario)}\n`;
    });
    
    return infoSala + '\u200B\n';
}

const formatLinhaInfo = (horario: Moment): string => {
    const previsao: string = previsaoBoss(horario);
    const bossVencido: boolean = isBossVencido(horario);
    const bossAberto: boolean = isBossAberto(horario);
    const linhaInfoSala: string = `${horario.isValid() ? horario.format('HH:mm (DD/MM)') : ''} ${previsao}`;
    return `${bossVencido ? spoiler(strikethrough(linhaInfoSala)) : linhaInfoSala} ${bossVencido ? '❌' : bossAberto ? '✅' : '💤'}`;
}

const isBossAberto = (horario: Moment): boolean => {
    if (!horario || !horario.isValid()) return false;
    
    const dataAtual = moment().utcOffset('GMT-03:00');
    const dataNascimentoBossInicio = moment(horario).add(config.bossFirestoreConfig.horaBossInicial, 'hours');

    return dataAtual.isAfter(dataNascimentoBossInicio);
}

const isBossVencido = (horario: Moment): boolean => {
    if (!horario || !horario.isValid()) return false;

    const dataAtual = moment().utcOffset('GMT-03:00');
    const dataNascimentoBossFim = moment(horario).add(config.bossFirestoreConfig.horaBossFinal, 'hours');

    return dataAtual.isAfter(dataNascimentoBossFim);
}

const previsaoBoss = (horario: Moment): string => {
    if (!horario || !horario.isValid()) return '';

    const horarioNascimentoBossInicio = moment(horario).add(config.bossFirestoreConfig.horaBossInicial, 'hours').format('HH:mm');
    const horarioNascimentoBossFim = moment(horario).add(config.bossFirestoreConfig.horaBossFinal, 'hours').format('HH:mm');

    return bold(`[de ${horarioNascimentoBossInicio} até ${horarioNascimentoBossFim}]`);
}

const calcularHorarioRestanteBoss = (horario: Moment, horas: number): Moment => {
    const horarioResultante = moment(horario).add(horas, 'hours');
    return diffDatas(horarioResultante, dataNowMoment());
}

const vaiAbrirBoss = (horarioBoss: Moment): boolean => {
    return horarioBoss.isValid() && !isBossVencido(horarioBoss) && !isBossAberto(horarioBoss);
}

const vaiFecharBoss = (horarioBoss: Moment): boolean => {
    return horarioBoss.isValid() && !isBossVencido(horarioBoss) && isBossAberto(horarioBoss);
}

export { formatBoss, formatSalaBoss, isBossAberto, isBossVencido, previsaoBoss, calcularHorarioRestanteBoss, vaiAbrirBoss, vaiFecharBoss }