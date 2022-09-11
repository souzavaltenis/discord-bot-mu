import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { CategoryCommand } from "../models/enum/category-command";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";

export = {
    category: CategoryCommand.BOSS,
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Lista os horários dos boss!'),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply();
        await interaction.deleteReply();
		await mostrarHorarios(interaction.channel);
    }
}