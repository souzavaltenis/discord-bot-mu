/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EmbedBuilder } from "discord.js";
import { Usuario } from "../../models/usuario";
import { bold } from "@discordjs/builders";
import { dataNowMoment, distanceDatasInDays, formatTimestamp, isSameMoment, stringToMoment } from "../../utils/data-utils";
import { config } from "../../config/get-configs";
import { usuariosSingleton } from '../../models/singleton/usuarios-singleton';
import { escapeDiscordText, getTextPositionRank } from "../../utils/geral-utils";
import { Moment } from "moment";
import { ITimeOnlineInfo } from "../../models/interface/time-online-info";

let dataNow: Moment;
let dataNewRank: Moment;

const getEmbedTabelaRankOnline = (): EmbedBuilder => {
    dataNow = dataNowMoment();
    dataNewRank = stringToMoment(config().geral.dateNewRank);

    const usuariosGeral: Usuario[] = usuariosSingleton.usuarios.map((usuario: Usuario) => ({...usuario}));

    const embedTabelaRankOnline = new EmbedBuilder()
        .setColor("DarkBlue")
        .setTitle(`Rank Tempo Online 🏆`)
        .setFooter({ text: config().mu.avisoFooter || `Rank iniciado em ${dataNewRank.format('DD/MM/YYYY')}` });

    // Geral
    const limitUsersGeral: number = 10;
    const usuariosRankGeral: Usuario[] = sortUsuariosPorTempo(usuariosGeral, 'geral').slice(0, limitUsersGeral);
    addFieldsRank('geral', usuariosRankGeral, embedTabelaRankOnline, limitUsersGeral);

    // Semana
    const limitUsersSemana: number = 10;
    const usuariosRankSemanal: Usuario[] = sortUsuariosPorTempo(usuariosGeral, 'week').slice(0, limitUsersSemana);
    addFieldsRank('week', usuariosRankSemanal, embedTabelaRankOnline, limitUsersSemana);

    // Dia
    const limitUsersDia: number = 20;
    const usuariosRankDia: Usuario[] = sortUsuariosPorTempo(usuariosGeral, 'day').slice(0, limitUsersDia);
    addFieldsRank('day', usuariosRankDia, embedTabelaRankOnline, limitUsersDia);

    return embedTabelaRankOnline;
}

const addFieldsRank = (type: string, usuarios: Usuario[], embed: EmbedBuilder, limitUsers: number): void => {
    let msgUsuario: string = getTextDataByType(type) + '\n\u200B\n';
    let positionRank: number = 0;

    usuarios.slice(0, limitUsers).forEach((usuario: Usuario) => {
        const qtdMsOnline: number = calcularTempoOnlineTipo(usuario.timeOnline, type);

        if (qtdMsOnline === 0) return;

        const textMsOnline: string = formatTimestamp(qtdMsOnline);

        const isTop3: boolean = positionRank < 3;
        msgUsuario += `${getTextPositionRank(positionRank)} ${escapeDiscordText(usuario.name)}` +
            `  ${bold('→')}  ` +
            `( ${isTop3 ? bold(textMsOnline) : textMsOnline} )\n`;

        positionRank++;
    });

    if (msgUsuario.length > 1023) {
        msgUsuario = msgUsuario.slice(0, 1023);
    }

    embed.addFields([{ name: getTitleFieldByType(type), value: msgUsuario + '\u200B' }]);
}

const getTitleFieldByType = (type: string): string => {
    return {
        'geral': '👑 Geral',
        'week': '🔰 Semana',
        'day': '📅 Hoje'
    }[type] ?? '';
}

const getTextDataByType = (type: string): string => {
    switch (type) {
        case "geral":
            return `(${dataNewRank.format('DD/MM/YY')} até ${dataNow.format('DD/MM/YY')} → ${distanceDatasInDays(dataNow, dataNewRank)} dias)`;
        case "week":
            return `(${dataNow.clone().startOf('isoWeek').format('DD/MM/YY')} até ${dataNow.clone().endOf('isoWeek').format('DD/MM/YY')})`;
        case "day":
            return `(${dataNow.format('DD/MM/YY')})`
        default:
            return "";
    }
}

const sortUsuariosPorTempo = (usuarios: Usuario[], type: string): Usuario[] => {
    const qtdMsOnline = new Map<string, number>();

    usuarios.forEach(user => {
        qtdMsOnline.set(`${user.id}.${type}`, calcularTempoOnlineTipo(user.timeOnline, type));
    });
    
    return usuarios.slice().sort((a: Usuario, b: Usuario) => {
        const qtdMsOnlineA: number = qtdMsOnline.get(`${a.id}.${type}`)!;
        const qtdMsOnlineB: number = qtdMsOnline.get(`${b.id}.${type}`)!;

        return qtdMsOnlineA < qtdMsOnlineB ? 1 : qtdMsOnlineA > qtdMsOnlineB ? -1 : 0;
    });
}

const calcularTempoOnlineTipo = (timeOnline: Map<string, ITimeOnlineInfo>, type: string): number => {

    switch (type) {
        case 'geral':
            return [...timeOnline].reduce((acc, [, v]) => acc + v.timestampOnline, 0);
        case 'day':
            return timeOnline.get(dataNow.format('DD/MM/YYYY'))?.timestampOnline || 0;
        case 'week':
            return [...timeOnline].reduce((acc, [, v]) => {
                if (v.isOld) {
                    return acc;
                }

                return acc + (isSameMoment(dataNow, v.timestampDay, type) ? v.timestampOnline : 0);
            }, 0);
        default:
            return 0;
    }

}

export {
    getEmbedTabelaRankOnline
}