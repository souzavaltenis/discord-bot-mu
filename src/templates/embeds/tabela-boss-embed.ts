import { MessageEmbed } from "discord.js";
import { config } from "../../config/get-configs";
import { Boss } from "../../models/boss";
import { formatBoss } from "../../utils/boss-utils";
import { textoFooterRandom } from "../../utils/geral-utils";

const getEmbedTabelaBoss = (listaBoss: Boss[], isBackup?: boolean): MessageEmbed => {
    const embedTabelaBoss = new MessageEmbed()
        .setColor("DARK_BLUE")
        .setTitle("Tabela de Horários Boss")
        .setDescription("\u200B")
        .setFooter({ text: config().mu.avisoFooter || textoFooterRandom() })
        .setTimestamp();

    listaBoss.forEach((boss: Boss) => embedTabelaBoss.addField(boss.nome, formatBoss(boss)));

    if (isBackup) {
        embedTabelaBoss
            .setTitle('')
            .setColor("YELLOW")
            .setDescription('')
            .setFooter({ text: '' })
            .setTimestamp(null);
    }

    return embedTabelaBoss;
}

export { getEmbedTabelaBoss }