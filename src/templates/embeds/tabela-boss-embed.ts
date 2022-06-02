import { MessageEmbed } from "discord.js";
import { Boss } from "../../models/boss";
import { formatBoss } from "../../utils/boss-utils";
// import { tracos } from "../../utils/geral-utils";

const getEmbedTabelaBoss = (listaBoss: Boss[]): MessageEmbed => {
    const embedTabelaBoss = new MessageEmbed()
        .setColor("DARK_BLUE")
        .setTitle("Tabela de Horários Boss")
        .setDescription("\u200B")
        .setFooter({ text: "Listar horários: /list\nAdicionar horário: /add", iconURL: 'https://i.imgur.com/VzgX7yd.jpg' })
        .setTimestamp();

    listaBoss.forEach((boss: Boss) => embedTabelaBoss.addField(boss.nome, formatBoss(boss)));

    // embedTabelaBoss.addField("Descrição Ícones", `${tracos(55)}\n✅ aberto ❌ vencido 💤 irá abrir\n${tracos(55)}`);

    return embedTabelaBoss;
}

export { getEmbedTabelaBoss }