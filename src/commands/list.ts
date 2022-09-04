import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";

export = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Lista os horários dos boss!'),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply();
        await interaction.deleteReply();
		await mostrarHorarios(interaction.channel);
    }
}