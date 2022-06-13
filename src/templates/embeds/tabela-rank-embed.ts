import { MessageEmbed } from "discord.js";
import { Usuario } from "../../models/usuario";
import { consultarUsuarios } from "../../db/db";
import { bold, userMention } from "@discordjs/builders";
import { IBossInfoAdd } from "../../models/interface/boss-info-add";
import { isSameMoment } from "../../utils/data-utils";

const getEmbedTabelaRank = async (): Promise<MessageEmbed> => {

    const usuariosGeral: Usuario[] = await consultarUsuarios();

    const embedTabelaRank = new MessageEmbed()
        .setColor("DARK_BLUE")
        .setTitle("Rank de Anotações 🏆")
        .setDescription('\u200B');

    const limitUsers: number = 5;

    // Geral
    usuariosGeral.sort((a: Usuario, b: Usuario) => {
        if (a.anotacoes.length < b.anotacoes.length) return 1;
        if (a.anotacoes.length > b.anotacoes.length) return -1;
        return 0;
    });
    addFieldsRank('👑 Total', '', usuariosGeral, embedTabelaRank, limitUsers);

    // Semanal
    const usuariosSemanal = sortUsuariosPorTempo(usuariosGeral, 'week').slice(0, limitUsers);
    addFieldsRank('🧰 Semanal', 'week', usuariosSemanal, embedTabelaRank, limitUsers);

    // Dia
    const usuariosDia = sortUsuariosPorTempo(usuariosGeral, 'day').slice(0, limitUsers);
    addFieldsRank('📅 Diário', 'day', usuariosDia, embedTabelaRank, limitUsers);

    return embedTabelaRank;
}

const addFieldsRank = (titleField: string, type: string, usuarios: Usuario[], embed: MessageEmbed, limitUsers: number): void => {
    let msgUsuario = '\u200B\n';

    usuarios.slice(0, limitUsers).forEach((usuario, index) => {
        const quantidadeAnotacoes = type ? calcularHorariosPorTempo(usuario.anotacoes, type) : usuario.anotacoes.length;
        msgUsuario += `${bold((index+1)+'°')} ${userMention(usuario.id)} [ ${quantidadeAnotacoes} ${quantidadeAnotacoes > 1 ? 'anotações' : 'anotação'} ]\n`;
    });

    embed.addField(titleField, msgUsuario + '\u200B' || '\u200B');
}

const sortUsuariosPorTempo = (usuarios: Usuario[], type: string): Usuario[] => {
    return usuarios.slice().sort((a: Usuario, b: Usuario) => {
        if (calcularHorariosPorTempo(a.anotacoes, type) < calcularHorariosPorTempo(b.anotacoes, type)) return 1;
        if (calcularHorariosPorTempo(a.anotacoes, type) > calcularHorariosPorTempo(b.anotacoes, type)) return -1;
        return 0;
    });
}

const calcularHorariosPorTempo = (anotacoes: IBossInfoAdd[], type: string): number => {
    return anotacoes.filter(a => isSameMoment(a.timestampAcao, type)).length;
}

export { getEmbedTabelaRank }