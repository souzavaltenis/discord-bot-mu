import { MessageEmbed, TextBasedChannel } from "discord.js";
import { Boss } from "../models/boss";
import { consultarHorarioBoss } from "../db/db";
import { formatBoss } from "../utils/boss-utils";
import { tracos } from "../utils/geral-utils";
import { agendarAvisos } from "../utils/avisos-utils";

const mostrarHorarios = async (textChannel: TextBasedChannel | null) => {

    await consultarHorarioBoss().then(async (listaBoss: Boss[]) => {

        agendarAvisos(listaBoss);

        const embedTabelaBoss = new MessageEmbed()
            .setColor("DARK_BLUE")
            .setTitle("Tabela de Horários Boss")
            .setDescription("\u200B")
            .setFooter({ text: "Listar horários: /list\nAdicionar horário: /add", iconURL: 'https://i.imgur.com/VzgX7yd.jpg' })
            .setTimestamp();

        listaBoss.forEach((boss: Boss) => embedTabelaBoss.addField(boss.nome, formatBoss(boss)));

        embedTabelaBoss.addField("Descrição Ícones", `${tracos(55)}\n✅ aberto ❌ vencido 💤 irá abrir\n${tracos(55)}`);

        await textChannel?.send({ embeds: [embedTabelaBoss] });
    });
}

export { mostrarHorarios };