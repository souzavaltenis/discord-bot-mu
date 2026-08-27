/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { bold } from "@discordjs/builders";
import { ActivityType } from "discord.js";
import moment, { Moment } from "moment";
import { config } from '../config/get-configs';
import { client } from "../index";
import { Boss } from "../models/boss";
import { SalaBoss } from "../models/sala-boss";
import { ListBossSingleton } from "../models/singleton/list-boss-singleton";
import { dataNowMoment, diffDatas } from "./data-utils";
import { sleep, tracos } from "./geral-utils";

const formatBoss = (boss: Boss, somenteAbertos?: boolean): string => {
    let infoBoss: string = tracos(50) + '\n';
    let haBossAbertos: boolean = false;

    boss.salas.forEach((horario: Moment, sala: number) => {
        if (somenteAbertos && (!isBossAberto(horario) || isBossVencido(horario))) return;
        haBossAbertos = true;
        infoBoss += `${bold(`Sala ${sala}`)}: ${formatLinhaInfo(horario, boss.vivo.get(sala))}\n`;
    });

    if (somenteAbertos && !haBossAbertos) {
        infoBoss += 'Nenhum aberto\n';
    }

    return infoBoss;
};

const formatSalaBoss = (bossSalas: SalaBoss[]) => {
    let infoSala: string = tracos(62) + '\n';

    bossSalas.forEach((salaBoss: SalaBoss) => {
        infoSala += `${bold(`${salaBoss.nomeBoss}`)}: ${formatLinhaInfo(salaBoss.horario)}\n`;
    });

    return infoSala;
}

const bossEstaVivo = (horarioMorte: Moment, vivo?: Moment): boolean => {
    return !!vivo && vivo.isValid() && vivo.isAfter(horarioMorte);
}

const formatLinhaInfo = (horario: Moment, vivo?: Moment): string => {
    const previsao: string = previsaoBoss(horario);
    const bossVencido: boolean = isBossVencido(horario);
    const bossAberto: boolean = isBossAberto(horario);
    const linhaInfoSala: string = `${horario.isValid() ? horario.format('HH:mm (DD/MM)') : ''} ${previsao}`;
    const icone: string = bossEstaVivo(horario, vivo)
        ? '🗡️'
        : (bossVencido ? '❌' : bossAberto ? '✅' : '💤');
    return `${linhaInfoSala} ${icone}`;
}

const isBossAberto = (horario: Moment): boolean => {
    if (!horario || !horario.isValid()) return false;

    const dataAtual = dataNowMoment();
    const dataNascimentoBossInicio = moment(horario).add(config().mu.horaBossInicial, 'hours');

    return dataAtual.isAfter(dataNascimentoBossInicio);
}

const isBossVencido = (horario: Moment): boolean => {
    if (!horario || !horario.isValid()) return false;

    const dataAtual = dataNowMoment();
    const dataNascimentoBossFim = moment(horario).add(config().mu.horaBossFinal, 'hours');

    return dataAtual.isAfter(dataNascimentoBossFim);
}

const previsaoBoss = (horario: Moment): string => {
    if (!horario || !horario.isValid()) return '';

    const horarioNascimentoBossInicio = moment(horario).add(config().mu.horaBossInicial, 'hours').format('HH:mm');
    const horarioNascimentoBossFim = moment(horario).add(config().mu.horaBossFinal, 'hours').format('HH:mm');

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
    const horarioAbertura = moment(horario).add(config().mu.horaBossInicial, 'hours');
    return diffDatas(horarioAbertura, dataNowMoment());
}

const previsaoParaFechar = (horario: Moment): Moment => {
    const horarioFechamento = moment(horario).add(config().mu.horaBossFinal, 'hours');
    return diffDatas(horarioFechamento, dataNowMoment());
}

const sortBossPorHorario = (salas: Map<number, Moment>, isAbrir: boolean): Map<number, Moment> => {
    return new Map<number, Moment>(
        [...salas.entries()]
            .filter((x: [number, Moment]) => isAbrir ? vaiAbrirBoss(x[1]) : vaiFecharBoss(x[1]))
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
    await sleep(5000);
    const listaBoss: Boss[] = ListBossSingleton.getInstance().boss;

    const contadorBossAbertos: number = listaBoss.reduce((acumulador: number, value: Boss) => {
        return acumulador + Array.from(value.salas.values()).filter((horario: Moment) => vaiFecharBoss(horario)).length;
    }, 0);

    client.user?.setPresence({ activities: [{ name: `${contadorBossAbertos} Boss Abertos`, type: ActivityType.Playing }], status: 'idle' });
}

const consultarSalaPadrao = (): string => {
    const salasBoss: number[] = config().mu.salasPermitidas;

    return salasBoss.length === 1 ? salasBoss[0].toString() : "";
}

export {
    atualizarStatusBot, calcularHorarioRestanteBoss, consultarSalaPadrao, formatBoss, formatLinhaInfo, formatSalaBoss, isBossAberto,
    isBossVencido,
    previsaoBoss, previsaoParaAbrir,
    previsaoParaFechar,
    sortBossPorHorario, vaiAbrirBoss,
    vaiFecharBoss
};

