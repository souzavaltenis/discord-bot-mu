import { MessageEmbed } from "discord.js";
import { Boss } from "../../models/boss";
import { formatBoss } from "../../utils/boss-utils";
import { textoFooterRandom } from "../../utils/geral-utils";

const getEmbedTabelaBoss = (listaBoss: Boss[]): MessageEmbed => {
    const embedTabelaBoss = new MessageEmbed()
        .setColor("DARK_BLUE")
        .setTitle("Tabela de Horários Boss")
        .setDescription("\u200B")
        .setFooter({ text: textoFooterRandom()})
        .setTimestamp();

    listaBoss.forEach((boss: Boss) => embedTabelaBoss.addField(boss.nome, formatBoss(boss)));

    return embedTabelaBoss;
}

export { getEmbedTabelaBoss }