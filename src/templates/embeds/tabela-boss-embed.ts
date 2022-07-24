import { APIEmbedField, bold, EmbedBuilder } from "discord.js";
import { config } from "../../config/get-configs";
import { Boss } from "../../models/boss";
import { formatBoss } from "../../utils/boss-utils";
import { timestampToMoment } from "../../utils/data-utils";
import { textoFooterRandom } from "../../utils/geral-utils";

const getEmbedTabelaBoss = (listaBoss: Boss[], timestampBackup?: number): EmbedBuilder => {
    const fieldsBoss: APIEmbedField[] = listaBoss.map((b => { 
        return { name: b.nome, value: formatBoss(b) } as APIEmbedField
    }));

    return timestampBackup
        ?  new EmbedBuilder()
            .setColor("DarkerGrey")
            .addFields([
                ...fieldsBoss,
                { name: '\u200B', value: `💾 Backup selecionado: ${bold(timestampToMoment(timestampBackup).format("HH:mm (DD/MM)"))}` }
            ])
        : new EmbedBuilder()
            .setColor("DarkBlue")
            .setTitle("Tabela de Horários Boss")
            .setDescription("\u200B")
            .setFooter({ text: config().mu.avisoFooter || textoFooterRandom() })
            .addFields(fieldsBoss)
            .setTimestamp();
}

export { getEmbedTabelaBoss }