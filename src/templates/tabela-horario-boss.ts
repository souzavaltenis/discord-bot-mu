import { Interaction, MessageEmbed } from "discord.js";
import { Boss } from "../models/boss";
import { consultarHorarioBoss } from "../db/db";
import { formatBoss } from "../utils/boss-utils";
import { tracos } from "../utils/geral-utils";
import { agendarAvisos } from "../utils/avisos-utils";

const mostrarHorarios = async (interaction: Interaction) => {

    consultarHorarioBoss().then(async (listaBoss: Boss[]) => {

        agendarAvisos(listaBoss, interaction.client);

        const embedTabelaBoss = new MessageEmbed()
            .setColor("DARK_BLUE")
            .setTitle("Tabela de Horários Boss")
            .setDescription("\u200B")
            .setTimestamp()
            .setFooter({ 
                text: "Para listar horários: /list\nPara adicionar novo horário: /add\n" + `${interaction.user.tag}`, 
                iconURL: interaction.user?.avatarURL() || '' 
            });

        listaBoss.forEach((boss: Boss) => embedTabelaBoss.addField(boss.nome, formatBoss(boss)));

        embedTabelaBoss.addField("Descrição Ícones",  `${tracos(55)}\n✅ aberto ❌ vencido 💤 irá abrir\n${tracos(55)}`);

        await interaction.channel?.send({ embeds: [embedTabelaBoss] });
    });
}

export { mostrarHorarios };