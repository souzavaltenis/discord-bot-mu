import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { CategoryCommand } from "../models/enum/category-command";

export = {
    category: CategoryCommand.GERAL,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Comando teste'),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
		await interaction.reply('Pong!');
    }
}