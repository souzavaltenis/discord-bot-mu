import { MessageEmbed, TextBasedChannel } from "discord.js";
import { Boss } from "../models/boss";
import { consultarHorarioBoss } from "../utils/db";
import { formatBoss } from "../utils/format-boss";

const mostrarHorarios = async (textChannel: TextBasedChannel | null) => {

    consultarHorarioBoss().then(async (listaBoss: Boss[]) => {

        const embedTabelaBoss = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Tabela de Horários Boss')
            .setDescription('\u200B')
            .setFooter({ text: "Para listar horários: /list\nPara adicionar novo horário: /add", iconURL: 'https://i.imgur.com/VzgX7yd.jpg' });

        listaBoss.forEach((boss: Boss) => {
            embedTabelaBoss.addField(boss.nome, formatBoss(boss), true);
        });

        embedTabelaBoss.addField('\u200B', '\u200B');

        await textChannel?.send({ embeds: [embedTabelaBoss] });
    });
}

export { mostrarHorarios };