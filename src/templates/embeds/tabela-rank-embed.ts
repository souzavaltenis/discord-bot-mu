import { MessageEmbed } from "discord.js";
import { Usuario } from "../../models/usuario";
import { consultarUsuarios } from "../../db/db";
import { bold, underscore, userMention } from "@discordjs/builders";
import { isSameMoment } from "../../utils/data-utils";
import { underbold } from "../../utils/geral-utils";

const getEmbedTabelaRank = async (): Promise<MessageEmbed> => {

    const usuariosGeral: Usuario[] = await consultarUsuarios();

    const embedTabelaRank = new MessageEmbed()
        .setColor("DARK_BLUE")
        .setTitle("Rank de Anotações 🏆")
        .setDescription('\u200B');

    const limitUsers: number = 10;

    // Geral
    usuariosGeral.sort((a: Usuario, b: Usuario) => {
        if (a.timestampsAnotacoes.length < b.timestampsAnotacoes.length) return 1;
        if (a.timestampsAnotacoes.length > b.timestampsAnotacoes.length) return -1;
        return 0;
    });
    addFieldsRank('', usuariosGeral, embedTabelaRank, limitUsers);

    // Semanal
    const usuariosSemanal = sortUsuariosPorTempo(usuariosGeral, 'week').slice(0, limitUsers);
    addFieldsRank('week', usuariosSemanal, embedTabelaRank, limitUsers);

    // Dia
    const usuariosDia = sortUsuariosPorTempo(usuariosGeral, 'day').slice(0, limitUsers);
    addFieldsRank('day', usuariosDia, embedTabelaRank, limitUsers);

    return embedTabelaRank;
}

const addFieldsRank = (type: string, usuarios: Usuario[], embed: MessageEmbed, limitUsers: number): void => {
    let msgUsuario = '\u200B\n';

    usuarios.slice(0, limitUsers).forEach((usuario, index) => {
        const quantidadeAnotacoes = type ? calcularHorariosPorTempo(usuario.timestampsAnotacoes, type) : usuario.timestampsAnotacoes.length;
        if (quantidadeAnotacoes === 0) return;
        const mentionUser: string = userMention(usuario.id);
        msgUsuario += `${getTextPosition(index)} ${index < 3 ? underscore(mentionUser) : mentionUser} [ ${quantidadeAnotacoes} ${quantidadeAnotacoes > 1 ? 'anotações' : 'anotação'} ]\n`;
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
        case '': return '👑 Total';
        case 'week': return '🔰 Semana';
        case 'day': return '📅 Hoje';
        default: return '';
    }
}

const sortUsuariosPorTempo = (usuarios: Usuario[], type: string): Usuario[] => {
    return usuarios.slice().sort((a: Usuario, b: Usuario) => {
        if (calcularHorariosPorTempo(a.timestampsAnotacoes, type) < calcularHorariosPorTempo(b.timestampsAnotacoes, type)) return 1;
        if (calcularHorariosPorTempo(a.timestampsAnotacoes, type) > calcularHorariosPorTempo(b.timestampsAnotacoes, type)) return -1;
        return 0;
    });
}

const calcularHorariosPorTempo = (timestampsAnotacoes: number[], type: string): number => {
    return timestampsAnotacoes.filter(timestamp => isSameMoment(timestamp, type)).length;
}

export { getEmbedTabelaRank }