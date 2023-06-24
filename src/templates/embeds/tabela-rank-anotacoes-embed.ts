/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EmbedBuilder, userMention } from "discord.js";
import { Usuario } from "../../models/usuario";
import { bold } from "@discordjs/builders";
import { dataNowMoment, isSameMoment } from "../../utils/data-utils";
import { config } from "../../config/get-configs";
import { usuariosSingleton } from '../../models/singleton/usuarios-singleton';
import { Moment } from "moment";
import { getTextPositionRank } from "../../utils/geral-utils";

let dataNow: Moment;

const getEmbedTabelaRankAnotacoes = (): EmbedBuilder => {
    dataNow = dataNowMoment();
    const usuariosGeral: Usuario[] = usuariosSingleton.usuarios.map((usuario: Usuario) => ({...usuario}));

    const embedTabelaRank = new EmbedBuilder()
        .setColor("DarkBlue")
        .setTitle(`Rank de Anotações 🏆`)
        .setFooter({ text: config().mu.avisoFooter || 'Rank iniciado em 14/06/23' })
        .setTimestamp();

    const limitUsers: number = 10;

    // Geral
    usuariosGeral.sort((a: Usuario, b: Usuario) => {
        if (a.timestampsAnotacoes.length < b.timestampsAnotacoes.length) return 1;
        if (a.timestampsAnotacoes.length > b.timestampsAnotacoes.length) return -1;
        return 0;
    });
    addFieldsRank('', usuariosGeral, embedTabelaRank, limitUsers);

    // Semana
    const usuariosSemanal = sortUsuariosPorTempo(usuariosGeral, 'week').slice(0, limitUsers);
    addFieldsRank('week', usuariosSemanal, embedTabelaRank, limitUsers);

    // Dia
    const usuariosDia = sortUsuariosPorTempo(usuariosGeral, 'day').slice(0, limitUsers);
    addFieldsRank('day', usuariosDia, embedTabelaRank, limitUsers);

    return embedTabelaRank;
}

const addFieldsRank = (type: string, usuarios: Usuario[], embed: EmbedBuilder, limitUsers: number): void => {
    let msgUsuario: string = '\u200B\n';
    let positionRank: number = 0;

    usuarios.slice(0, limitUsers).forEach((usuario) => {
        const quantidadeAnotacoes: number = type ? calcularHorariosPorTempo(usuario.timestampsAnotacoes, type) : usuario.timestampsAnotacoes.length;
        if (quantidadeAnotacoes === 0) return;
        const isTop3: boolean = positionRank < 3;
        msgUsuario += `${getTextPositionRank(positionRank)} ${userMention(usuario.id)}` +
            `  ${bold('→')}  ` +
            `( ${isTop3 ? bold(quantidadeAnotacoes + '') : quantidadeAnotacoes} ${quantidadeAnotacoes > 1 ? 'anotações' : 'anotação'} )\n`;

        positionRank++;
    });

    embed.addFields([{ name: getTitleFieldByType(type), value: msgUsuario + '\u200B' || '\u200B' }]);
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

    usuarios.forEach(user => {
        qtdHorarios.set(`${user.id}.${type}`, calcularHorariosPorTempo(user.timestampsAnotacoes, type));
    });
    
    return usuarios.slice().sort((a: Usuario, b: Usuario) => {
        const qtdHorariosA: number = qtdHorarios.get(`${a.id}.${type}`)!;
        const qtdHorariosB: number = qtdHorarios.get(`${b.id}.${type}`)!;

        return qtdHorariosA < qtdHorariosB ? 1 : qtdHorariosA > qtdHorariosB ? -1 : 0;
    });
}

const calcularHorariosPorTempo = (timestampsAnotacoes: number[], type: string): number => {
    let quantidadeHorarios: number = 0;
    
    for(let i = 0; i < timestampsAnotacoes.length; i++) {
        if (timestampsAnotacoes[i] !== 0 && isSameMoment(dataNow, timestampsAnotacoes[i], type)) {
            quantidadeHorarios++;
        }
    }

    return quantidadeHorarios;
}

export {
    getEmbedTabelaRankAnotacoes
}