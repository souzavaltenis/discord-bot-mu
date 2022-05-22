import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { mostrarHorarios } from "../templates/tabela-horario-boss";

export class List {
    data: SlashCommandBuilder = new SlashCommandBuilder().setName('list').setDescription('Lista os horários dos boss!');

    async execute(interaction: CommandInteraction): Promise<void> {
      await interaction.reply({content: 'eae', fetchReply: true, ephemeral: true})
		  await mostrarHorarios(interaction.channel);
    }
}