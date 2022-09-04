import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";

export = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Comando teste'),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
		await interaction.reply('Pong!');
    }
}