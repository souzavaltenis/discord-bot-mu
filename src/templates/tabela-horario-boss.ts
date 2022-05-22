import { Interaction, MessageEmbed, TextBasedChannel } from "discord.js";
import { Boss } from "../models/boss";
import { consultarHorarioBoss } from "../utils/db";
import { formatBoss } from "../utils/format-boss";

const mostrarHorarios = async (interaction: Interaction) => {

    consultarHorarioBoss().then(async (listaBoss: Boss[]) => {

        const embedTabelaBoss = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle("Tabela de Horários Boss")
            .setDescription("\u200B")
            .setFooter({ text: "Para listar horários: /list\n" + 
                                "Para adicionar novo horário: /add\n" + 
                                `${interaction.user.tag}`, iconURL: "https://i.imgur.com/VzgX7yd.jpg" })
            .setTimestamp();

        listaBoss.forEach((boss: Boss) => {
            embedTabelaBoss.addField(boss.nome, formatBoss(boss));
        });

        embedTabelaBoss.addField("Descrição Ícones", 
            "-------------------------------------------------------\n" + 
            ":white_check_mark: aberto :x: vencido :zzz: irá abrir\n" +
            "-------------------------------------------------------"
        );

        await interaction.channel?.send({ embeds: [embedTabelaBoss] });
    });
}

export { mostrarHorarios };