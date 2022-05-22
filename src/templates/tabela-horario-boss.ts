import { MessageEmbed, TextBasedChannel } from "discord.js";
import { Boss } from "../models/boss";
import { consultarHorarioBoss } from "../utils/db";
import { formatBoss } from "../utils/format-boss";

const mostrarHorarios = async (textChannel: TextBasedChannel | null) => {

    consultarHorarioBoss().then(async (listaBoss: Boss[]) => {

        const embedTabelaBoss = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Tabela de Horários Boss')
            .setDescription('\u200B');

        listaBoss.forEach((boss: Boss) => {
            embedTabelaBoss.addField(boss.nome, formatBoss(boss), true);
        });

        await textChannel?.send({ embeds: [embedTabelaBoss] });
    });
}

export { mostrarHorarios };