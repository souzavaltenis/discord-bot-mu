/* eslint-disable @typescript-eslint/no-non-null-assertion */
import moment, { Moment } from "moment";
import { Boss } from "../models/boss";
import { tracos } from "./geral-utils";
import { config } from '../config/get-configs';
import { bold } from "@discordjs/builders";
import { dataNowMoment, diffDatas } from "./data-utils";
import { SalaBoss } from "../models/sala-boss";
import { ListBossSingleton } from "../models/singleton/list-boss-singleton";
import { client } from "../index";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { TextChannel } from "discord.js";

const formatBoss = (boss: Boss, somenteAbertos?: boolean): string => {
    let infoBoss: string = tracos(55) + '\n';
    let haBossAbertos: boolean = false;

    boss.salas.forEach((horario: Moment, sala: number) => {
        if (somenteAbertos && (!isBossAberto(horario) || isBossVencido(horario))) return;
        haBossAbertos = true;
        infoBoss += `${bold(`Sala ${sala}`)}: ${formatLinhaInfo(horario)}\n`;
    });

    if (somenteAbertos && !haBossAbertos) {
        infoBoss += 'Nenhum aberto\n';
    }

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
    return `${linhaInfoSala} ${bossVencido ? '❌' : bossAberto ? '✅' : '💤'}`;
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

const previsaoParaAbrir = (horario: Moment): Moment => {
    const horarioAbertura = moment(horario).add(config.bossFirestoreConfig.horaBossInicial, 'hours');
    return diffDatas(horarioAbertura, dataNowMoment());
}

const sortBossAbertosByHorario = (salas: Map<number, Moment>): Map<number, Moment> => {
    return new Map<number, Moment>(
        [...salas.entries()]
        .filter((x: [number, Moment]) => vaiAbrirBoss(x[1]))
        .sort((a: [number, Moment], b: [number, Moment]) => {
            if (a[1].isAfter(b[1])) {
                return 1;
            }
            if (a[1].isBefore(b[1])) {
                return -1;
            }
            return 0;
        })
    );
}

const atualizarStatusBot = async (): Promise<void> => {
    const listaBoss: Boss[] = ListBossSingleton.getInstance().boss;

    const contadorBossAbertos: number = listaBoss.reduce((acumulador: number, value: Boss) => {
        return acumulador + Array.from(value.salas.values()).filter((horario: Moment) => vaiFecharBoss(horario)).length;
    }, 0);

    client.user?.setPresence({ activities: [{ name: `${contadorBossAbertos} Boss Abertos`, type: 'PLAYING' }], status: 'idle' });
}
const mandarHorarios = async (): Promise<void> => {
    const mainTextChannel = client.channels.cache.get(config.channelTextId) as TextChannel;
    await mostrarHorarios(mainTextChannel);
}

export { 
    formatBoss, 
    formatSalaBoss, 
    formatLinhaInfo, 
    isBossAberto, 
    isBossVencido, 
    previsaoBoss, 
    calcularHorarioRestanteBoss, 
    vaiAbrirBoss, 
    vaiFecharBoss, 
    previsaoParaAbrir,
    sortBossAbertosByHorario,
    atualizarStatusBot,
    mandarHorarios
}