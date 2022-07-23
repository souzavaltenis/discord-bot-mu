/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MessageEmbed } from "discord.js";
import { Usuario } from "../../models/usuario";
import { bold, underscore } from "@discordjs/builders";
import { isSameMoment } from "../../utils/data-utils";
import { textoFooterRandom } from "../../utils/geral-utils";
import { config } from "../../config/get-configs";
import { usuariosSingleton } from '../../models/singleton/usuarios-singleton';

const getEmbedTabelaRank = (): MessageEmbed => {

    const usuariosGeral: Usuario[] = usuariosSingleton.usuarios;

    const embedTabelaRank = new MessageEmbed()
        .setColor("DARK_BLUE")
        .setTitle("Rank de Anotações 🏆")
        .setDescription('\u200B')
        .setFooter({ text: config().mu.avisoFooter || textoFooterRandom() })
        .setTimestamp();

    const limitUsers: number = 10;

    // Geral
    const initGeral = new Date().valueOf();
    usuariosGeral.sort((a: Usuario, b: Usuario) => {
        if (a.timestampsAnotacoes.length < b.timestampsAnotacoes.length) return 1;
        if (a.timestampsAnotacoes.length > b.timestampsAnotacoes.length) return -1;
        return 0;
    });
    addFieldsRank('', usuariosGeral, embedTabelaRank, limitUsers);
    const endGeral = new Date().valueOf();
    console.log("type: Geral total: " + ((endGeral-initGeral)/1000) + " s");

    // Semanal
    const initSemanal = new Date().valueOf();
    const usuariosSemanal = sortUsuariosPorTempo(usuariosGeral, 'week').slice(0, limitUsers);
    addFieldsRank('week', usuariosSemanal, embedTabelaRank, limitUsers);
    const endSemanal = new Date().valueOf();
    console.log("type: Semanal total: " + ((endSemanal-initSemanal)/1000) + " s");

    // Dia
    const initDiario = new Date().valueOf();
    const usuariosDia = sortUsuariosPorTempo(usuariosGeral, 'day').slice(0, limitUsers);
    addFieldsRank('day', usuariosDia, embedTabelaRank, limitUsers);
    const endDiario = new Date().valueOf();
    console.log("type: Diario total: " + ((endDiario-initDiario)/1000) + " s\n-----------------\n");

    return embedTabelaRank;
}

const addFieldsRank = (type: string, usuarios: Usuario[], embed: MessageEmbed, limitUsers: number): void => {
    let msgUsuario = '\u200B\n';

    usuarios.slice(0, limitUsers).forEach((usuario, index) => {
        const quantidadeAnotacoes: number = type ? calcularHorariosPorTempo(usuario.timestampsAnotacoes, type) : usuario.timestampsAnotacoes.length;
        if (quantidadeAnotacoes === 0) return;
        const userName: string = bold(usuario.name.split("#")[0]);
        msgUsuario += `${getTextPosition(index)} ${index < 3 ? underscore(userName) : userName}  →  ( ${bold(quantidadeAnotacoes + '')} ${quantidadeAnotacoes > 1 ? 'anotações' : 'anotação'} )\n`;
    });

    embed.addField(getTitleFieldByType(type), msgUsuario + '\u200B' || '\u200B');
}

const getTextPosition = (index: number): string => {
    switch (index) {
        case 0: return '🥇';
        case 1: return '🥈';
        case 2: return '🥉';
        default: return `${index+1}°`;
    }
}

const getTitleFieldByType = (type: string): string => {
    switch (type) {
        case '': return '👑 Geral';
        case 'week': return '🔰 Semana';
        case 'day': return '📅 Hoje';
        default: return '';
    }
}

const sortUsuariosPorTempo = (usuarios: Usuario[], type: string): Usuario[] => {
    const qtdHorarios = new Map<string, number>();
    
    return usuarios.slice().sort((a: Usuario, b: Usuario) => {
        const keyUserA = `${a.id}.${type}`;
        const keyUserB = `${b.id}.${type}`;

        if (!qtdHorarios.get(keyUserA)) {
            qtdHorarios.set(keyUserA, calcularHorariosPorTempo(a.timestampsAnotacoes, type))
        }
        
        if (!qtdHorarios.get(keyUserB)) {
            qtdHorarios.set(keyUserB, calcularHorariosPorTempo(b.timestampsAnotacoes, type))
        }

        const qtdHorariosA: number = qtdHorarios.get(keyUserA)!;
        const qtdHorariosB: number = qtdHorarios.get(keyUserB)!;

        return qtdHorariosA < qtdHorariosB ? 1 : qtdHorariosA > qtdHorariosB ? -1 : 0;
    });
}

const calcularHorariosPorTempo = (timestampsAnotacoes: number[], type: string): number => {
    return timestampsAnotacoes.filter(timestamp => isSameMoment(timestamp, type)).length;
}

export { getEmbedTabelaRank }