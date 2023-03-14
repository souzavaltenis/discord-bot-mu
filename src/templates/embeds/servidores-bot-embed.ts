import { EmbedBuilder } from "discord.js";
import { IGuildInfos } from "../../models/interface/guild-infos";

const getEmbedServidoresBot = (guilds: IGuildInfos[]): EmbedBuilder => {

    const embedServidoresBot = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle(`Servidores: ${guilds.length}`)
        .setDescription('\u200B');

    guilds.forEach((guild: IGuildInfos) => {
        embedServidoresBot.addFields({
            name: guild.nomeGuild,
            value: `Dono: ${guild.nomeOwnerGuild}\nMembros: ${guild.quantidadeMembros}\nBot entrou em: ${guild.dataEntradaBot.format('DD/MM/YYYY HH:mm:ss')}\n\u200B`
        });
    });

    return embedServidoresBot;
}

export { getEmbedServidoresBot }