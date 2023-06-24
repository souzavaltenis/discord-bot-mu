/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EmbedBuilder, userMention } from "discord.js";
import { Usuario } from "../../models/usuario";
import { bold } from "@discordjs/builders";
import { formatTimestamp } from "../../utils/data-utils";
import { config } from "../../config/get-configs";
import { usuariosSingleton } from '../../models/singleton/usuarios-singleton';
import { getTextPositionRank } from "../../utils/geral-utils";

const getEmbedTabelaRankOnline = (): EmbedBuilder => {
    const usuariosGeral: Usuario[] = usuariosSingleton.usuarios.map((usuario: Usuario) => ({...usuario}));

    const embedTabelaRankOnline = new EmbedBuilder()
        .setColor("DarkBlue")
        .setTitle(`Rank de Tempo Online 🏆`)
        .setFooter({ text: config().mu.avisoFooter || 'Rank iniciado em 24/06/23' })
        .setTimestamp();

    const limitUsers: number = 20;

    usuariosGeral.sort((a: Usuario, b: Usuario) => {
        return a.totalTimeOnline < b.totalTimeOnline ? 1 : -1;
    });

    let positionRank: number = 0;
    let textRankOnline: string = '\u200B\n';

    usuariosGeral.slice(0, limitUsers).forEach((usuario) => {
        if (usuario.totalTimeOnline === 0) return;
        const isTop3: boolean = positionRank < 3;
        const textTotalTimeOnline: string = formatTimestamp(usuario.totalTimeOnline);
        
        textRankOnline += `${getTextPositionRank(positionRank)} ${userMention(usuario.id)}` +
            `  ${bold('→')}  ` +
            `( ${isTop3 ? bold(textTotalTimeOnline + '') : textTotalTimeOnline} )\n`;

        positionRank++;
    });

    textRankOnline += '\u200B\n';
    
    embedTabelaRankOnline.setDescription(textRankOnline || 'Nenhum resultado encontrado...');
    
    return embedTabelaRankOnline;
}

export {
    getEmbedTabelaRankOnline
}